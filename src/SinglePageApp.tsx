import { FadeThrough, SharedAxis, SharedAxisTransform } from "material-design-transform";
import { Divider, Icon, List, ListItem, NavigationDrawer, NavigationDrawerPadding, Typography } from "rmcw/dist/components3";
import { ReactAppContext, ReactStreamAppContext, ReactWindowContext, StreamAppContext, WindowContext } from "./common/AppContext";
import { Page } from "./common/Page";
import CircularBuffer from "./common/CircularBuffer";
import { dummyMessageData, MessageData } from "./common/MessageData";
import React from "react";
import socketStatsToIcon from "./common/SocketStatsToIcon";
import getPage from "./pages";

export default function SinglePageApp({ streamAppContext }: { streamAppContext: StreamAppContext; }) {
  const [page, setPage] = React.useState(Page.Engine);
  const { socketStats, openNetwork, openSettings } = React.useContext(ReactAppContext);
  const { messageData } = streamAppContext;

  const [showEnginePowerCurve, setShowEnginePowerCurve] = React.useState(true);
  const [detailOption, setDetailOption] = React.useState("timestampMs");
  const [showDetailDelta, setShowDetailDelta] = React.useState(false);
  const windowContext = React.useMemo<WindowContext>(() => {
    return {
      showEnginePowerCurve, setShowEnginePowerCurve,
      detailOption, setDetailOption,
      showDetailDelta, setShowDetailDelta
    };
  }, [detailOption, showDetailDelta, showEnginePowerCurve]);

  return <div className="rmcw-drawer fill-parent">
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
            <span title={`Socket: ${socketStats}`}><Icon>{socketStatsToIcon(socketStats)}</Icon></span>
          </FadeThrough>}
          onClick={openNetwork}>Network</ListItem>
        <ListItem type='button' trailingSupportingText={(slotName) => <Icon slot={slotName}>settings</Icon>}
          onClick={openSettings}>Settings</ListItem>
      </List>
    </NavigationDrawer>
    <NavigationDrawerPadding opened style={{ height: "100%" }}>
      <ReactWindowContext.Provider value={windowContext}>
        <ReactStreamAppContext.Provider value={streamAppContext}>
          <SharedAxis className="fill-parent" keyId={page}
            transform={SharedAxisTransform.fromLeftToRight}>
            {getPage(page)}
          </SharedAxis>
        </ReactStreamAppContext.Provider>
      </ReactWindowContext.Provider>
    </NavigationDrawerPadding>
  </div>;
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
