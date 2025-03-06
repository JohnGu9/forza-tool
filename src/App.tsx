import './App.css';
import { Divider, Icon, List, ListItem, NavigationDrawer, NavigationDrawerPadding, Theme, Typography } from 'rmcw/dist/components3';
import Engine from './pages/Engine';
import Settings from './pages/Settings';
import React from 'react';
import Tire from './pages/TIre';
import { listenData } from './ipc';
import { analyzeMessageData, dummyMessageData, MessageData, MessageDataAnalysis, newMessageDataAnalysis, parseMessageData, resetMessageDataAnalysis } from './common/MessageData';
import CircularBuffer from './common/CircularBuffer';
import { FadeThrough, SharedAxis, SharedAxisTransform } from 'material-design-transform';
import { AppContext, ListenAddress, ReactAppContext, ReactStreamAppContext, SocketStats, StreamAppContext, UnitSystem } from './common/AppContext';
import Detail from './pages/Detail';
import SpeedMeter from './pages/SpeedMeter';
import Network from './pages/Network';
import { listen } from '@tauri-apps/api/event';
import Control from './pages/Control';
import Tachometer from './pages/Tachometer';

export default function App() {
  const [isOpenSettings, setOpenSettings] = React.useState(false);
  const openSettings = React.useCallback(() => setOpenSettings(true), []);
  const closeSettings = React.useCallback(() => setOpenSettings(false), []);

  const [isOpenNetwork, setOpenNetwork] = React.useState(false);
  const openNetwork = React.useCallback(() => setOpenNetwork(true), []);
  const closeNetwork = React.useCallback(() => setOpenNetwork(false), []);

  const [page, setPage] = React.useState(Page.Engine);

  const [enableDarkTheme, setEnableDarkTheme] = React.useState(undefined as undefined | boolean);
  const [unitSystem, setUnitSystem] = React.useState(UnitSystem.International);

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
  const messageDataAnalysis = React.useMemo<MessageDataAnalysis>(() => newMessageDataAnalysis(dataBufferLength), [dataBufferLength]);

  const [errorMessage, setErrorMessage] = React.useState<string[]>([]);

  const [tick, _setTick] = React.useState(0); // CircularBuffer data updated flag
  const updateTick = React.useCallback(() => _setTick(value => {
    if (++value === Number.MAX_SAFE_INTEGER) {
      return Number.MIN_SAFE_INTEGER;
    }
    return value;
  }), []);

  const [socketStats, setSocketStats] = React.useState(SocketStats.closed);

  const resetData = React.useCallback(() => {
    messageData.clear();
    resetMessageDataAnalysis(messageDataAnalysis);
    updateTick();
  }, [messageData, messageDataAnalysis, updateTick]);

  const [showEnginePowerCurve, setShowEnginePowerCurve] = React.useState(true);
  const [detailOption, setDetailOption] = React.useState("timestampMs");
  const [showDetailDelta, setShowDetailDelta] = React.useState(false);

  const appContext = React.useMemo<AppContext>(() => {
    return {
      resetData, socketStats,
      listenAddress, setListenAddress,
      enableDarkTheme, setEnableDarkTheme,
      unitSystem, setUnitSystem,
      dataBufferLength, setDataBufferLength,
      errorMessage, setErrorMessage,
      showEnginePowerCurve, setShowEnginePowerCurve,
      detailOption, setDetailOption,
      showDetailDelta, setShowDetailDelta
    };
  }, [resetData, socketStats, listenAddress, setListenAddress, enableDarkTheme, unitSystem, dataBufferLength, setDataBufferLength, errorMessage, showEnginePowerCurve, detailOption, showDetailDelta]);

  const streamAppContext = React.useMemo<StreamAppContext>(() => {
    return { messageData, messageDataAnalysis, tick };
  }, [messageData, messageDataAnalysis, tick]);

  React.useEffect(() => {
    setSocketStats(SocketStats.opening);
    const [address, port, forwardSwitch, forwardAddress, forwardPort] = listenAddress;
    const forward = forwardSwitch ? `${forwardAddress}:${forwardPort}` : null;
    const addErrorMessage = (errorMessage: string) => setErrorMessage((current) => {
      current.push(errorMessage);
      return [...current.slice(Math.max(current.length - 20, 0))];
    });
    const onData = (event: { event: 'data'; data: { data: number[]; }; }) => {
      try {
        const data = parseMessageData(event.data.data);
        if (!data.isRaceOn) {
          return;
        }
        // log(`${JSON.stringify(data)}`);
        if (isNeedToReset(messageData, data)) { // car changed
          resetData();
        }
        messageData.push(data);
        analyzeMessageData(messageData, messageDataAnalysis);
        // log(`${messageData.map(data => data.timestampMs).slice(-6)}`);
      } catch (error) {
        addErrorMessage(`[${new Date().toTimeString()}] ${error}`);
      }
      updateTick();
    };
    const unlisten = listen<{ event: 'data'; data: { data: number[]; }; }>("on-data", event => onData(event.payload));
    listenData(`${address}:${port}`, forward, (event) => {
      switch (event.event) {
        case "error":
          setSocketStats(SocketStats.error);
          addErrorMessage(`[${new Date().toTimeString()}] ${event.data.reason}`);
          break;
        case "messageError":
          addErrorMessage(`[${new Date().toTimeString()}] ${event.data.reason}`);
          break;
        // case "data":
        //   onData(event);
        //   break;
        case "opened":
          setSocketStats(SocketStats.opened);
          break;
        case "closed":
          setSocketStats(SocketStats.closed);
          break;
      }
      updateTick();
      return () => { (async () => { (await unlisten)(); })(); };
    });
  }, [listenAddress, messageData, messageDataAnalysis, resetData, updateTick]);

  return (
    <ReactAppContext.Provider value={appContext}>
      <Theme className='fill-parent' withBackgroundColor enableDarkTheme={enableDarkTheme} style={{ "--md-sys-color-tertiary": "#82ca9d" } as React.CSSProperties}>
        <div className="rmcw-drawer fill-parent">
          <NavigationDrawer opened style={{
            position: "absolute", display: "flex", flexDirection: "column",
            "--md-navigation-drawer-container-shape": "0 8px 8px 0",
          } as React.CSSProperties}>
            <List style={{ padding: 0, flex: "1 1" }}>
              <Typography.Headline.Large tag='div' style={{ padding: 16 }}>Forza</Typography.Headline.Large>
              <Divider />
              {Object.values(Page).map(value =>
                <ListItem key={value} type='button' onClick={() => setPage(value)}
                  style={page === value ? {
                    backgroundColor: "rgb(from var(--md-sys-color-primary-fixed-dim) r g b / 0.2)",
                    "--md-list-item-label-text-color": "var(--md-sys-color-primary)"
                  } as React.CSSProperties : undefined}>
                  {value}
                </ListItem>)}
            </List>
            <List style={{ padding: 0 }}>
              <LapTime messageData={messageData} />
              <ListItem type='button' trailingSupportingText={
                <FadeThrough keyId={socketStats}>
                  <span title={`Socket: ${socketStats}`}><Icon>{toIcon(socketStats)}</Icon></span>
                </FadeThrough>}
                onClick={openNetwork}>Network</ListItem>
              <ListItem type='button' trailingSupportingText={(slotName) => <Icon slot={slotName}>settings</Icon>}
                onClick={openSettings}>Settings</ListItem>
            </List>
          </NavigationDrawer>
          <NavigationDrawerPadding opened style={{ height: "100%" }}>
            <ReactStreamAppContext.Provider value={streamAppContext}>
              <SharedAxis className="fill-parent" keyId={page}
                transform={SharedAxisTransform.fromLeftToRight}>
                {(() => {
                  switch (page) {
                    case Page.Engine:
                      return <Engine />;
                    case Page.Tire:
                      return <Tire />;
                    case Page.Tachometer:
                      return <Tachometer />;
                    case Page.Detail:
                      return <Detail />;
                    case Page.SpeedMeter:
                      return <SpeedMeter />;
                    case Page.Control:
                      return <Control />;

                  }
                })()}
              </SharedAxis>
            </ReactStreamAppContext.Provider>
          </NavigationDrawerPadding>
        </div>
        <Network opened={isOpenNetwork} close={closeNetwork} />
        <Settings opened={isOpenSettings} close={closeSettings} />
      </Theme>
    </ReactAppContext.Provider >
  );
}

function LapTime({ messageData }: { messageData: CircularBuffer<MessageData>; }) {
  const lastData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  return <ListItem supportingText={toTimeString(lastData.currentLapTime)} trailingSupportingText={
    (slotName) => <div slot={slotName} className='flex-column' style={{ justifyContent: "center", alignItems: "end" }}>
      <div>Best: {toTimeString(lastData.bestLapTime)}</div>
      <div>Last: {toTimeString(lastData.lastLapTime)}</div>
    </div>
  }>Lap Time</ListItem>;
}

function toTimeString(seconds: number) {
  const s = seconds % 60;
  const m = seconds / 60;
  return `${m.toFixed(0).padStart(2, "0")}:${s.toFixed(3).replace(".", ":").padStart(6, "0")}`;
}

function toIcon(socketStats: SocketStats) {
  switch (socketStats) {
    case SocketStats.opening:
      return "settings_input_antenna";
    case SocketStats.opened:
      return "wifi_tethering";
    case SocketStats.error:
      return "error";
    case SocketStats.closed:
      return "warning";
  }
}

enum Page {
  Engine = "Engine",
  Tire = "Tire & Wheel",
  Tachometer = "Tachometer",
  SpeedMeter = "SpeedMeter",
  Control = "Control",
  Detail = "Detail",
};

function isNeedToReset(messageData: CircularBuffer<MessageData>, newData: MessageData) {
  if (messageData.isEmpty()) {
    return false;
  }
  const lastData = messageData.getLastUnsafe();
  if (lastData.carOrdinal === newData.carOrdinal &&
    lastData.carPerformanceIndex === newData.carPerformanceIndex &&
    lastData.drivetrainType === newData.drivetrainType &&
    lastData.numCylinders === newData.numCylinders
  ) {
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
