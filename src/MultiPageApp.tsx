import { FadeThrough, SharedAxis, SharedAxisTransform } from "material-design-transform";
import React from "react";
import { Button, Dialog, Divider, Icon, IconButton, ListItem } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext, ReactWindowContext, StreamAppContext, WindowContext } from "./common/AppContext";
import { Page } from "./common/Page";
import socketStatsToIcon from "./common/SocketStatsToIcon";
import getPage, { MultiPageAppContext, ReactMultiPageAppContext } from "./pages";

type WindowTag = { id: number; page: Page; };

export default function MultiPageApp({ streamAppContext }: { streamAppContext: StreamAppContext; }) {
  const { resetData, socketStats, openNetwork, openSettings, lastOpenedPage, setLastOpenedPage, errorMessage, setErrorMessage } = React.useContext(ReactAppContext);
  function recoveryPages(): WindowTag[] {
    const value = localStorage.getItem("multi-page"); // only storage page, no id
    if (value !== null) {
      try {
        const parse = JSON.parse(value);
        if (Array.isArray(parse) && parse.length !== 0) {
          const availablePage = new Set(Object.values(Page));
          return parse.map((value, index) => {
            if (availablePage.has(value)) {
              return { id: parse.length - index, page: value as Page };
            }
            return { id: parse.length - index, page: Page.Engine };
          });
        }

      } catch (e) {
        setErrorMessage([...errorMessage, `[${new Date().toTimeString()}] ${e}`]);
      }
    }

    return [{ id: 0, page: lastOpenedPage }];
  }
  const [windows, _setWindows] = React.useState<WindowTag[]>(recoveryPages);
  const setWindows = React.useCallback((newValue: WindowTag[]) => {
    _setWindows(newValue);
    localStorage.setItem("multi-page", JSON.stringify(newValue.map(v => v.page))); // only storage page, no id
  }, []);
  const usedPages = React.useMemo(() => { return new Set(windows.map(v => v.page)); }, [windows]);
  const multiPageAppContext = React.useMemo<MultiPageAppContext>(() => { return { usedPages }; }, [usedPages]);

  return <ReactMultiPageAppContext.Provider value={multiPageAppContext}>
    <div className="fill-parent flex-row">
      <div className="flex-column" style={{ width: 48, alignItems: "center", padding: "12px 0", gap: 16 }}>
        <span title="add window">
          <IconButton onClick={() => setWindows([{ id: windows[0].id + 1, page: getUnusedPage(windows) }, ...windows])}><Icon>add</Icon></IconButton>
        </span>
        <div className="flex-child" />
        <span title="reset data">
          <IconButton onClick={resetData}><Icon>clear_all</Icon></IconButton>
        </span>
        <span title={`Socket: ${socketStats}`}>
          <FadeThrough keyId={socketStats}>
            <IconButton onClick={openNetwork}><Icon>{socketStatsToIcon(socketStats)}</Icon></IconButton>
          </FadeThrough>
        </span>
        <span title="settings">
          <IconButton onClick={openSettings}><Icon>settings</Icon></IconButton>
        </span>
      </div>
      <div className="flex-row flex-child">
        <ReactStreamAppContext.Provider value={streamAppContext}>
          {windows.map((value) =>
            <SingleWindow key={value.id}
              page={value.page}
              setPage={(page) => {
                const index = windows.findIndex(v => v.id === value.id);
                if (index === -1) return;
                setWindows([...windows.slice(0, index), { id: value.id, page }, ...windows.slice(index + 1)]);
                setLastOpenedPage(page);
              }}
              closeWindow={() => {
                const index = windows.findIndex(v => v.id === value.id);
                if (index === -1) return;
                setWindows([...windows.slice(0, index), ...windows.slice(index + 1)]);
              }} />)}
        </ReactStreamAppContext.Provider>
      </div>
    </div>
  </ReactMultiPageAppContext.Provider>;
}

function getUnusedPage(windows: WindowTag[]) {
  const used = new Set(windows.map(v => v.page));
  for (const page of Object.values(Page)) {
    if (!used.has(page as Page)) {
      return page as Page;
    }
  }
  return Page.Engine;
}

function SingleWindow({ page, setPage, closeWindow }: { page: Page, setPage: (page: Page) => unknown, closeWindow: () => unknown; }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const closeDialog = React.useCallback(() => setOpenDialog(false), []);
  const [showEnginePowerCurve, setShowEnginePowerCurve] = React.useState(true);
  const [detailOption, setDetailOption] = React.useState("timestampMs");
  const [showDetailDelta, setShowDetailDelta] = React.useState(false);
  const { usedPages } = React.useContext(ReactMultiPageAppContext);
  const windowContext = React.useMemo<WindowContext>(() => {
    return {
      showEnginePowerCurve, setShowEnginePowerCurve,
      detailOption, setDetailOption,
      showDetailDelta, setShowDetailDelta
    };
  }, [detailOption, showDetailDelta, showEnginePowerCurve]);
  return <div className="flex-column flex-child" style={{ overflow: "clip" }}>
    <ListItem trailingSupportingText={<Icon>swap_horiz</Icon>} type="button"
      onClick={() => setOpenDialog(true)}>{page}</ListItem>
    <ReactWindowContext.Provider value={windowContext}>
      <SharedAxis className="flex-child" keyId={page}
        transform={SharedAxisTransform.fromLeftToRight}>
        {getPage(page)}
      </SharedAxis>
    </ReactWindowContext.Provider>
    <Dialog
      open={openDialog}
      onScrimClick={closeDialog}
      onEscapeKey={closeDialog}
      headline="Swap Page"
      actions={<Button buttonStyle="text" onClick={closeDialog}>Close</Button>}>
      <li className="flex-column" style={{ width: 360, gap: 16 }}>
        {Object.values(Page).map(value =>
          <Button key={value} buttonStyle={usedPages.has(value) ? "outlined" : "elevated"} disabled={page === value} onClick={() => { setPage(value); closeDialog(); }}>{value}</Button>)}
        <Divider />
        <Button buttonStyle="filled" onClick={closeWindow} style={{ "--md-sys-color-primary": "var(--md-sys-color-error)" } as React.CSSProperties} icon={<Icon>close</Icon>}>Remove This Page</Button>
      </li>
    </Dialog>
  </div>;
}
