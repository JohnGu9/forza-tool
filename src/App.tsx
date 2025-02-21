import './App.css';
import { Divider, Icon, List, ListItem, NavigationDrawer, NavigationDrawerPadding, Theme, Typography } from 'rmcw/dist/components3';
import Engine from './pages/Engine';
import Settings from './pages/Settings';
import React from 'react';
import Tire from './pages/TIre';
import { listenData } from './ipc';
import ErrorMessage from './pages/ErrorMessage';
import { analyzeMessageData, dummyMessageData, MessageData, MessageDataAnalysis, newMessageDataAnalysis, resetMessageDataAnalysis } from './common/MessageData';
import CircularBuffer from './common/CircularBuffer';
import { FadeThrough } from 'material-design-transform';
import { AppContext, ReactAppContext, ReactStreamAppContext, StreamAppContext } from './common/AppContext';
import Detail from './pages/Detail';
import SpeedMeter from './pages/SpeedMeter';

const capacity = 256;

export default function App() {
  const [isOpenSettings, setOpenSettings] = React.useState(false);
  const openSettings = React.useCallback(() => setOpenSettings(true), []);
  const closeSettings = React.useCallback(() => setOpenSettings(false), []);

  const [isOpenErrorMessage, setOpenErrorMessage] = React.useState(false);
  const openErrorMessage = React.useCallback(() => setOpenErrorMessage(true), []);
  const closeErrorMessage = React.useCallback(() => setOpenErrorMessage(false), []);

  const [page, setPage] = React.useState(Page.Engine);

  const [enableDarkTheme, setEnableDarkTheme] = React.useState(undefined as undefined | boolean);

  const [listenAddress, _setListenAddress] = React.useState<[string, string, number/* stamp, for manually renew socket on the same address:port */]>(() => {
    const address = localStorage.getItem("address") ?? "127.0.0.1";
    const port = localStorage.getItem("port") ?? "5300";
    return [address, port, 0];
  });
  const setListenAddress = React.useCallback(([newAddress, newPort, newStamp]: [string, string, number]) => {
    const [address, port, stamp] = listenAddress;
    if (newAddress !== address || newPort !== port || newStamp !== stamp) {
      _setListenAddress([newAddress, newPort, newStamp]);
      localStorage.setItem("address", newAddress);
      localStorage.setItem("port", newPort);
    }
  }, [listenAddress]);

  const messageData = React.useMemo<CircularBuffer<MessageData>>(() => new CircularBuffer<MessageData>(capacity), []);
  const messageDataAnalysis = React.useMemo<MessageDataAnalysis>(() => newMessageDataAnalysis(capacity), []);

  const [errorCollection, setErrorCollection] = React.useState<string[]>([]);
  const addErrorMessage = React.useCallback((errorMessage: string) => setErrorCollection((current) => {
    current.push(errorMessage);
    return [...current.slice(Math.max(current.length - 20, 0))];
  }), []);

  const [tick, _setTick] = React.useState(false); // CircularBuffer data updated flag
  const updateTick = React.useCallback(() => _setTick(value => !value), []);

  const [socketStats, setSocketStats] = React.useState(SocketStats.closed);

  const appContext = React.useMemo<AppContext>(() => {
    return { listenAddress, setListenAddress, enableDarkTheme, setEnableDarkTheme };
  }, [enableDarkTheme, listenAddress, setListenAddress]);

  const streamAppContext = React.useMemo<StreamAppContext>(() => {
    return { messageData, messageDataAnalysis, tick };
  }, [messageData, messageDataAnalysis, tick]);

  const lastListenAddress = React.useRef(["", "", 0]);
  React.useEffect(() => {
    // Patch: for react stupidly call useEffect twice
    // check the value whether changed or not
    if (lastListenAddress.current[0] !== listenAddress[0] ||
      lastListenAddress.current[1] !== listenAddress[1] ||
      lastListenAddress.current[2] !== listenAddress[2]) {
      lastListenAddress.current = listenAddress;
      setSocketStats(SocketStats.opening);
      listenData(`${listenAddress[0]}:${listenAddress[1]}`, (event) => {
        switch (event.event) {
          case "error":
            setSocketStats(SocketStats.error);
            addErrorMessage(`[${new Date().toDateString()}] ${event.data.reason}`);
            break;
          case "messageError":
            addErrorMessage(`[${new Date().toDateString()}] ${event.data.reason}`);
            break;
          case "data":
            if (isNeedToReset(messageData, event.data)) { // car changed
              messageData.clear();
              resetMessageDataAnalysis(messageDataAnalysis, capacity);
            }
            messageData.push(event.data);
            analyzeMessageData(messageData, messageDataAnalysis);
            break;
          case "opened":
            setSocketStats(SocketStats.opened);
            break;
          case "closed":
            setSocketStats(SocketStats.closed);
            break;
        }
        updateTick();
      });
    }

  }, [addErrorMessage, errorCollection, listenAddress, messageData, messageDataAnalysis, updateTick]);

  return (
    <ReactAppContext.Provider value={appContext}>
      <Theme className='fill-parent' withBackgroundColor enableDarkTheme={enableDarkTheme}>
        <div className="rmcw-drawer fill-parent">
          <NavigationDrawer opened style={{ position: "absolute", display: "flex", flexDirection: "column" }}>
            <List style={{ padding: 0, flexGrow: 1 }}>
              <div className="flex-row" style={{ justifyContent: "space-between", alignItems: "end", padding: 16 }}>
                <Typography.Headline.Large tag='div'>Forza</Typography.Headline.Large>
                <Typography.Body.Small tag='div'>Socket: {socketStats}</Typography.Body.Small>
              </div>
              <Divider />
              {Object.values(Page).map(value =>
                <ListItem key={value} type='button' onClick={() => setPage(value)}
                  trailingSupportingText={page === value ? <Icon>radio_button_checked</Icon> : <></>}>{value}</ListItem>)}
            </List>
            <List style={{ padding: 0 }}>
              <LapTime messageData={messageData} />
              <ListItem type='button' trailingSupportingText={(slotName) => <Icon slot={slotName}>error</Icon>}
                onClick={openErrorMessage}>Error Message</ListItem>
              <ListItem type='button' trailingSupportingText={(slotName) => <Icon slot={slotName}>settings</Icon>}
                onClick={openSettings}>Settings</ListItem>
            </List>
          </NavigationDrawer>
          <NavigationDrawerPadding opened style={{ height: "100%" }}>
            <ReactStreamAppContext.Provider value={streamAppContext}>
              <FadeThrough className="fill-parent" keyId={page}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}>
                {(() => {
                  switch (page) {
                    case Page.Engine:
                      return <Engine />;
                    case Page.Tire:
                      return <Tire />;
                    case Page.Detail:
                      return <Detail />;
                    case Page.SpeedMeter:
                      return <SpeedMeter />;
                  }
                })()}
              </FadeThrough>
            </ReactStreamAppContext.Provider>
          </NavigationDrawerPadding>
        </div>
        <ErrorMessage opened={isOpenErrorMessage} close={closeErrorMessage} errorCollection={errorCollection} />
        <Settings opened={isOpenSettings} close={closeSettings} />
      </Theme>
    </ReactAppContext.Provider>
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

enum SocketStats {
  opening = "Opening",
  opened = "Opened",
  error = "Error",
  closed = "Closed",
}

enum Page {
  Engine = "Engine",
  Tire = "Tire",
  SpeedMeter = "SpeedMeter",
  Detail = "Detail",
};

function isNeedToReset(messageData: CircularBuffer<MessageData>, newData: MessageData) {
  if (messageData.isEmpty()) {
    return false;
  }
  const lastData = messageData.getLastUnsafe();
  if (lastData.isRaceOn === newData.isRaceOn &&
    lastData.carOrdinal === newData.carOrdinal &&
    lastData.carPerformanceIndex === lastData.carPerformanceIndex &&
    lastData.numCylinders === lastData.numCylinders
  ) {
    return false;
  }
  return true;
}
