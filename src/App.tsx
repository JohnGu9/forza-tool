import "./App.scss";

import { listen } from "@tauri-apps/api/event";
import { MaterialDesignTransformContext, MaterialDesignTransformContextType, SharedAxisTransform } from "material-design-transform";
import React from "react";
import { Theme } from "rmcw/dist/components3";

import { AppContext, AppWindowMode, ListenAddress, ReactAppContext, StreamAppContext } from "./common/AppContext";
import CircularBuffer from "./common/CircularBuffer";
import { listenData } from "./common/Ipc";
import { MessageData, parseMessageData } from "./common/MessageData";
import { MessageDataAnalysis } from "./common/MessageDataAnalysis";
import { Page } from "./common/Page";
import { SocketState } from "./common/SocketState";
import { UnitSystem } from "./common/UnitConvert";
import MultiWindowApp from "./MultiWindowApp";
import Network from "./pages/Network";
import Settings from "./pages/Settings";
import SingleWindowApp from "./SingleWindowApp";

export default function App() {
  const [isOpenSettings, setOpenSettings] = React.useState(false);
  const openSettings = React.useCallback(() => setOpenSettings(true), []);
  const closeSettings = React.useCallback(() => setOpenSettings(false), []);

  const [isOpenNetwork, setOpenNetwork] = React.useState(false);
  const openNetwork = React.useCallback(() => setOpenNetwork(true), []);
  const closeNetwork = React.useCallback(() => setOpenNetwork(false), []);

  const [enableDarkTheme, setEnableDarkTheme] = React.useState(undefined as undefined | boolean);
  const [unitSystem, setUnitSystem] = React.useState(UnitSystem.Metric);

  const [listenAddress, _setListenAddress] = React.useState<ListenAddress>(() => {
    const address = localStorage.getItem("address") ?? "127.0.0.1";
    const port = localStorage.getItem("port") ?? "5300";
    const forwardSwitch = localStorage.getItem("forward-switch") === "true";
    const forwardAddress = localStorage.getItem("forward-address") ?? "127.0.0.1";
    const forwardPort = localStorage.getItem("forward-port") ?? "5400";
    return [address, port, forwardSwitch, forwardAddress, forwardPort, 0];
  });
  const setListenAddress = React.useCallback((newValue: ListenAddress) => {
    for (const [index, value] of newValue.entries()) {
      if (listenAddress[index] !== value) {
        _setListenAddress(newValue);
        localStorage.setItem("address", newValue[0]);
        localStorage.setItem("port", newValue[1]);
        localStorage.setItem("forward-switch", newValue[2] ? "true" : "false");
        localStorage.setItem("forward-address", newValue[3]);
        localStorage.setItem("forward-port", newValue[4]);
        break;
      }
    }
  }, [listenAddress]);

  const [dataBufferLength, _setDataBufferLength] = React.useState(parseIntSafe(localStorage.getItem("data-buffer-length")));
  const setDataBufferLength = React.useCallback((newValue: number) => {
    newValue = Math.ceil(Math.max(10, newValue));
    if (dataBufferLength !== newValue) {
      _setDataBufferLength(newValue);
      localStorage.setItem("data-buffer-length", newValue.toFixed(0));
    }
  }, [dataBufferLength]);

  const messageData = React.useMemo<CircularBuffer<MessageData>>(() => new CircularBuffer<MessageData>(dataBufferLength), [dataBufferLength]);
  const messageDataAnalysis = React.useMemo<MessageDataAnalysis>(() => new MessageDataAnalysis(dataBufferLength), [dataBufferLength]);

  const [errorMessage, setErrorMessage] = React.useState<string[]>([]);

  const [tick, _setTick] = React.useState(0); // CircularBuffer data updated flag
  const updateTick = React.useCallback(() => _setTick(value => {
    if (++value === Number.MAX_SAFE_INTEGER) {
      return Number.MIN_SAFE_INTEGER;
    }
    return value;
  }), []);
  const [isPaused, setPaused] = React.useState(true);

  const [socketStats, setSocketStats] = React.useState(SocketState.closed);

  const resetData = React.useCallback(() => {
    messageData.clear();
    messageDataAnalysis.reset();
    updateTick();
  }, [messageData, messageDataAnalysis, updateTick]);

  const [appWindowMode, _setAppWindowMode] = React.useState(() => {
    const record = localStorage.getItem("app-window-mode");
    if (record === null) {
      return AppWindowMode.Single;
    }
    const mode = JSON.parse(record);
    switch (mode) {
      case AppWindowMode.Single:
        return AppWindowMode.Single;
      case AppWindowMode.Multi:
        return AppWindowMode.Multi;
    }
    return AppWindowMode.Single;
  });
  const setAppWindowMode = React.useCallback((newState: AppWindowMode) => {
    localStorage.setItem("app-window-mode", JSON.stringify(newState));
    _setAppWindowMode(newState);
  }, []);
  React.useEffect(() => {
    switch (appWindowMode) {
      case AppWindowMode.Single: {
        localStorage.removeItem("multi-page");
        break;
      }
      case AppWindowMode.Multi:
    }
  }, [appWindowMode]);

  function recoverLastOpenedPage() {
    const lastOpenedPage = localStorage.getItem("last-opened-page");
    const availablePage = new Set<unknown>(Object.values(Page));
    if (availablePage.has(lastOpenedPage)) {
      return lastOpenedPage as Page;
    }
    return Page.Engine;
  }
  const [lastOpenedPage, _setLastOpenedPage] = React.useState(recoverLastOpenedPage);
  const setLastOpenedPage = React.useCallback((value: Page) => {
    _setLastOpenedPage(value);
    localStorage.setItem("last-opened-page", value);
  }, []);

  const appContext = React.useMemo<AppContext>(() => {
    return {
      openNetwork, openSettings,
      resetData, socketStats,
      listenAddress, setListenAddress,
      enableDarkTheme, setEnableDarkTheme,
      unitSystem, setUnitSystem,
      dataBufferLength, setDataBufferLength,
      errorMessage, setErrorMessage,
      lastOpenedPage, setLastOpenedPage,
      appWindowMode, setAppWindowMode,
    };
  }, [openNetwork, openSettings, resetData, socketStats, listenAddress, setListenAddress, enableDarkTheme, unitSystem, dataBufferLength, setDataBufferLength, errorMessage, lastOpenedPage, setLastOpenedPage, appWindowMode, setAppWindowMode]);

  const streamAppContext = React.useMemo<StreamAppContext>(() => {
    return { messageData, messageDataAnalysis, isPaused, tick };
  }, [isPaused, messageData, messageDataAnalysis, tick]);

  const addErrorMessage = React.useCallback((errorMessage: string) => setErrorMessage((current) => {
    current.push(errorMessage);
    return [...current.slice(Math.max(current.length - 20, 0))];
  }), []);

  React.useEffect(() => {
    const onData = (event: { event: "rawData"; data: { data: number[]; }; }) => {
      try {
        const data = parseMessageData(event.data.data);
        if (data.isRaceOn === 0) {
          setPaused(true);
          return;
        }
        setPaused(false);
        if (isNeedToReset(messageData, data)) { // car changed
          resetData();
        }
        messageData.push(data);
        messageDataAnalysis.analyze(messageData);
      } catch (error) {
        addErrorMessage(`[${new Date().toTimeString()}] ${error}`);
      }
      updateTick();
    };
    const unlisten = listen<{ event: "rawData"; data: { data: number[]; }; }>("on-data", event => onData(event.payload));
    return () => { unlisten.then(unlisten => unlisten()); };
  });

  React.useEffect(() => {
    setSocketStats(SocketState.opening);
    const [address, port, forwardSwitch, forwardAddress, forwardPort] = listenAddress;
    const forward = forwardSwitch ? `${forwardAddress}:${forwardPort}` : null;
    listenData(`${address}:${port}`, forward, (event) => {
      switch (event.event) {
        case "error":
          setSocketStats(SocketState.error);
          addErrorMessage(`[${new Date().toTimeString()}] ${event.data.reason}`);
          break;
        case "messageError":
          addErrorMessage(`[${new Date().toTimeString()}] ${event.data.reason}`);
          break;
        case "rawData":
          addErrorMessage(`[${new Date().toTimeString()}] Received unexpected message`);
          break;
        case "opened":
          setSocketStats(SocketState.opened);
          break;
        case "closed":
          setSocketStats(SocketState.closed);
          break;
      }
      updateTick();
    });
  }, [addErrorMessage, listenAddress, messageData, messageDataAnalysis, resetData, updateTick]);

  return (
    <MaterialDesignTransformContext.Provider value={materialDesignTransformContext}>
      <ReactAppContext.Provider value={appContext}>
        <Theme className="fill-parent app-theme" withBackgroundColor enableDarkTheme={enableDarkTheme}>
          {getWindow(appWindowMode, streamAppContext)}
          <Network opened={isOpenNetwork} close={closeNetwork} />
          <Settings opened={isOpenSettings} close={closeSettings} />
        </Theme>
      </ReactAppContext.Provider>
    </MaterialDesignTransformContext.Provider>
  );
}

const materialDesignTransformContext: MaterialDesignTransformContextType = { transitionStyle: "M3", sharedAxis: { transform: SharedAxisTransform.fromLeftToRight, unit: "px" } };

function getWindow(mode: AppWindowMode, streamAppContext: StreamAppContext) {
  switch (mode) {
    case AppWindowMode.Single:
      return <SingleWindowApp streamAppContext={streamAppContext} />;
    case AppWindowMode.Multi:
      return <MultiWindowApp streamAppContext={streamAppContext} />;
  }
}

function isNeedToReset(messageData: CircularBuffer<MessageData>, newData: MessageData) {
  const lastData = messageData.getLast();
  if (lastData === undefined) {
    return false;
  }
  if (lastData.carOrdinal === newData.carOrdinal &&
    lastData.carPerformanceIndex === newData.carPerformanceIndex &&
    lastData.drivetrainType === newData.drivetrainType &&
    lastData.numCylinders === newData.numCylinders) {
    return false;
  }
  return true;
}

function parseIntSafe(value: string | null, defaultValue = 256) {
  if (value === null) {
    return defaultValue;
  }
  try {
    return Math.max(10, parseInt(value));
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
}
