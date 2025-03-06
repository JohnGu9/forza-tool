import { Button, Dialog, Icon, IconButton, ListItem } from "rmcw/dist/components3";
import { ReactAppContext, ReactStreamAppContext, ReactWindowContext, StreamAppContext, WindowContext } from "./common/AppContext";
import { FadeThrough, SharedAxis, SharedAxisTransform } from "material-design-transform";
import React from "react";
import socketStatsToIcon from "./common/SocketStatsToIcon";
import getPage from "./pages";
import { Page } from "./common/Page";

export default function MultiPageApp({ streamAppContext }: { streamAppContext: StreamAppContext; }) {
  const { socketStats, openNetwork, openSettings } = React.useContext(ReactAppContext);
  const [windows, setWindows] = React.useState([0]);
  return <div className="fill-parent flex-row">
    <div className="flex-column" style={{ width: 48, alignItems: "center", padding: "12px 0", gap: 16 }}>
      <IconButton onClick={() => setWindows([windows[0] + 1, ...windows])}><Icon>add</Icon></IconButton>
      <div style={{ flex: "1 1", minHeight: 0 }} />
      <FadeThrough keyId={socketStats}>
        <span title={`Socket: ${socketStats}`}>
          <IconButton onClick={openNetwork}><Icon>{socketStatsToIcon(socketStats)}</Icon></IconButton>
        </span>
      </FadeThrough>
      <IconButton onClick={openSettings}><Icon>settings</Icon></IconButton>
    </div>
    <div className="flex-row" style={{ flex: "1 1", minWidth: 0 }}>
      <ReactStreamAppContext.Provider value={streamAppContext}>
        {windows.map((key) => <SingleWindow key={key} closeWindow={() => {
          const index = windows.findIndex(v => v === key);
          if (index === -1) return;
          setWindows([...windows.slice(0, index), ...windows.slice(index + 1)]);
        }} />)}
      </ReactStreamAppContext.Provider>
    </div>
  </div>;
}

function SingleWindow({ closeWindow }: { closeWindow: () => unknown; }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const closeDialog = React.useCallback(() => setOpenDialog(false), []);

  const [page, setPage] = React.useState(Page.Engine);

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
  return <div className="flex-column" style={{ flex: "1 1", minWidth: 0, overflow: "clip" }}>
    <ListItem trailingSupportingText={<Icon>swap_horiz</Icon>} type="button"
      onClick={() => setOpenDialog(true)}>{page}</ListItem>
    <ReactWindowContext.Provider value={windowContext}>
      <SharedAxis style={{ flex: "1 1", minHeight: 0 }} keyId={page}
        transform={SharedAxisTransform.fromLeftToRight}>
        {getPage(page)}
      </SharedAxis>
    </ReactWindowContext.Provider>
    <Dialog
      open={openDialog}
      onScrimClick={closeDialog}
      onEscapeKey={closeDialog}
      headline="Swap Page"
      actions={<Button buttonStyle='text' onClick={closeDialog}>Close</Button>}>
      <div className="flex-column" style={{ width: 360, gap: 16 }}>
        {Object.values(Page).map(value =>
          <Button key={value} buttonStyle="outlined" onClick={() => { setPage(value); closeDialog(); }}>{value}</Button>)}
        <div aria-hidden />
        <Button onClick={closeWindow}>Close Window</Button>
      </div>
    </Dialog>
  </div>;
}
