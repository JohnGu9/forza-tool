import "./MultiWindowApp.scss";

import { FadeThrough, SharedAxis, SharedAxisTransform } from "material-design-transform";
import { Curves, Duration } from "material-design-transform/dist/common";
import React from "react";
import { Button, Dialog, Fab, Icon, IconButton, ListItem } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext, StreamAppContext } from "./common/AppContext";
import { MessageDataKey } from "./common/MessageData";
import { Page } from "./common/Page";
import { isSocketError, socketStateToIcon } from "./common/SocketState";
import getPage from "./pages";
import { MotionOption, WindowContext, ReactWindowContext, SpeedMeterOption, TireOption } from "./pages/common/Context";

type WindowTag = { id: number; page: Page; };

type MultiWindowAppContext = {
  usedPages: Set<Page>,
};

type DragContext = {
  source: WindowTag | null;
  target: WindowTag | null;
};

const ReactDragContext = React.createContext(undefined as unknown as {
  value: DragContext;
  setValue: (v: DragContext) => unknown;
  swapWindow: () => unknown;
});

const ReactMultiWindowAppContext = React.createContext(undefined as unknown as MultiWindowAppContext);

export default function MultiWindowApp({ streamAppContext }: { streamAppContext: StreamAppContext; }) {
  const { resetData, socketStats, openNetwork, openSettings, lastOpenedPage, setLastOpenedPage, errorMessage, setErrorMessage } = React.useContext(ReactAppContext);

  const [windows, _setWindows] = React.useState<WindowTag[]>((): WindowTag[] => {
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
  });
  const setWindows = React.useCallback((newValue: WindowTag[]) => {
    _setWindows(newValue);
    localStorage.setItem("multi-page", JSON.stringify(newValue.map(v => v.page))); // only storage page, no id
  }, []);
  const usedPages = React.useMemo(() => { return new Set(windows.map(v => v.page)); }, [windows]);
  const multiPageAppContext = React.useMemo<MultiWindowAppContext>(() => { return { usedPages }; }, [usedPages]);

  const [dragContextValue, setDragContextValue] = React.useState<DragContext>({ source: null, target: null });
  const swapWindow = React.useCallback(() => {
    const { source, target } = dragContextValue;
    if (source !== null && target !== null) { // likely
      const newWindows = [...windows];
      const sourceIndex = newWindows.findIndex(v => v.id === source.id);
      const targetIndex = newWindows.findIndex(v => v.id === target.id);
      if (sourceIndex !== -1 && targetIndex !== -1) { // likely
        newWindows[sourceIndex] = { id: newWindows[sourceIndex].id, page: target.page };
        newWindows[targetIndex] = { id: newWindows[targetIndex].id, page: source.page };
        setWindows(newWindows);
      }
    }
  }, [dragContextValue, setWindows, windows]);
  const dragContext = React.useMemo(() => {
    return {
      value: dragContextValue,
      setValue: setDragContextValue,
      swapWindow,
    };
  }, [dragContextValue, swapWindow]);

  function getNewWindowId() {
    if (windows.length === 0) {
      return 0;
    }
    return windows[0].id + 1;
  }

  return <ReactMultiWindowAppContext.Provider value={multiPageAppContext}>
    <div className="fill-parent flex-row">
      <div className="flex-column app-navigation-rails">
        <span title="Add Window">
          <Fab icon={<Icon>add</Icon>} onClick={() => setWindows([{ id: getNewWindowId(), page: getUnusedPage(windows) }, ...windows])} />
        </span>
        <div className="flex-child" />
        <span title="Clear Data">
          <IconButton onClick={resetData}><Icon>clear_all</Icon></IconButton>
        </span>
        <span title={`Socket: ${socketStats}`}>
          <FadeThrough keyId={socketStats} transitionStyle="M3">
            <IconButton onClick={openNetwork}>
              <Icon style={{ color: isSocketError(socketStats) ? "var(--md-sys-color-error)" : undefined, transition: "color 200ms" }}>{socketStateToIcon(socketStats)}</Icon>
            </IconButton>
          </FadeThrough>
        </span>
        <span title="Settings">
          <IconButton onClick={openSettings}><Icon>settings</Icon></IconButton>
        </span>
      </div>

      <ReactDragContext.Provider value={dragContext}>
        <ReactStreamAppContext.Provider value={streamAppContext}>
          <FadeThrough keyId={windows.length} className="flex-row flex-child">
            {windows.map((value) =>
              <SingleWindow key={value.id}
                windowTag={value}
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
          </FadeThrough>
        </ReactStreamAppContext.Provider>
      </ReactDragContext.Provider>

    </div>
  </ReactMultiWindowAppContext.Provider>;
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

const dividerColor = "var(--md-divider-color, var(--md-sys-color-outline-variant, #cac4d0))";

function SingleWindow({ windowTag, setPage, closeWindow }: { windowTag: WindowTag, setPage: (page: Page) => unknown, closeWindow: () => unknown; }) {
  const { page: realPage } = windowTag;
  const [openDialog, setOpenDialog] = React.useState(false);
  const closeDialog = React.useCallback(() => setOpenDialog(false), []);
  const [showEnginePowerCurve, setShowEnginePowerCurve] = React.useState(true);
  const [tireOption, setTireOption] = React.useState(TireOption.SlipAngle);
  const [motionOption, setMotionOption] = React.useState(MotionOption.Acceleration);
  const [speedMeterOption, setSpeedMeterOption] = React.useState(SpeedMeterOption.VelocityVsSpeed);
  const [detailOption, setDetailOption] = React.useState<MessageDataKey>("timestampMs");
  const [showDetailDelta, setShowDetailDelta] = React.useState(false);
  const { usedPages } = React.useContext(ReactMultiWindowAppContext);
  const { messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const [isDragging, setDragging] = React.useState(false);
  const [isDragover, setDragover] = React.useState(false);
  const dragContext = React.useContext(ReactDragContext);
  // @TODO: swap windowContext when swap window
  const windowContext = React.useMemo<WindowContext>(() => {
    return {
      padding: "8px 16px 16px",
      tireOption, setTireOption,
      motionOption, setMotionOption,
      speedMeterOption, setSpeedMeterOption,
      showEnginePowerCurve, setShowEnginePowerCurve,
      detailOption, setDetailOption,
      showDetailDelta, setShowDetailDelta
    };
  }, [detailOption, motionOption, showDetailDelta, showEnginePowerCurve, speedMeterOption, tireOption]);

  function getDisplayPage() {
    if (isDragging) {
      return dragContext.value.target?.page ?? realPage;
    }
    if (isDragover) {
      return dragContext.value.source?.page ?? realPage;
    }
    return realPage;
  }
  const displayPage = getDisplayPage();

  /**
   * Caution:
   * Drag and drop function requires tauri(v2)'s configuration "dragDropEnabled" is false
   * reference: https://github.com/tauri-apps/tauri/issues/3277
   */

  return <>
    <div className="window-divider" />
    <div className="flex-child flex-column"
      style={{
        transform: openDialog ? "scale(1.02)" : undefined,
        transition: `transform ${Duration.M3["md.sys.motion.duration.medium4"]}ms ${Curves.M3.Emphasized}`
      }}>
      <ListItem
        draggable
        onDragStart={e => {
          e.dataTransfer.effectAllowed = "all";
          setDragging(true);
          dragContext.setValue({ ...dragContext.value, source: windowTag });
        }}
        onDragEnd={() => {
          dragContext.setValue({ source: null, target: null });
          setDragging(false);
        }}
        onDragOver={isDragging ? undefined : e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDragover(true);
          dragContext.setValue({ ...dragContext.value, target: windowTag });
        }}
        onDragLeave={isDragging ? undefined : () => {
          dragContext.setValue({ ...dragContext.value, target: null });
          setDragover(false);
        }}
        onDrop={isDragging ? undefined : e => {
          e.preventDefault();
          setDragover(false);
          dragContext.swapWindow();
        }}
        style={{
          opacity: isDragging || isDragover ? 0.5 : undefined,
          backgroundColor: isDragging ? "var(--md-sys-color-background)" : undefined,
          backgroundImage: !isDragging && dragContext.value.source !== null ? `radial-gradient(${dividerColor} 5%, transparent 0)` : undefined,
          backgroundSize: "12px 12px",
          transform: isDragging || isDragover ? "scale(0.97)" : (dragContext.value.source !== null ? "scale(0.99)" : undefined),
          outline: dragContext.value.source !== null && !isDragging ? `1px dotted ${dividerColor}` : `0px dotted ${dividerColor}`,
          transition: `opacity ${Duration.M3["md.sys.motion.duration.short4"]}ms, outline ${Duration.M3["md.sys.motion.duration.short4"]}ms, transform ${Duration.M3["md.sys.motion.duration.medium4"]}ms ${Curves.M3.Emphasized}`,
        }}
        trailingSupportingText={<span title="Swap Page">
          <IconButton onClick={() => setOpenDialog(true)}><Icon style={{ color: openDialog ? "var(--md-sys-color-primary)" : undefined }}>swap_horiz</Icon></IconButton>
        </span>}>
        <SharedAxis keyId={displayPage} transform={SharedAxisTransform.fromLeftToRight} style={{ color: openDialog ? "var(--md-sys-color-primary)" : undefined }}>
          {displayPage}
        </SharedAxis>
      </ListItem>
      <ReactWindowContext.Provider value={windowContext}>
        <SharedAxis className="flex-child" keyId={`${displayPage} ${messageDataAnalysis.id}`}>
          {getPage(displayPage)}
        </SharedAxis>
      </ReactWindowContext.Provider>
    </div>
    <Dialog
      open={openDialog}
      onScrimClick={closeDialog}
      onEscapeKey={closeDialog}
      headline="Swap Page"
      actions={<>
        <Button className="close-window-button" buttonStyle="filled" onClick={async () => {
          setOpenDialog(false);
          await new Promise((resolve) => setTimeout(resolve, 150));
          closeWindow();
        }}
          icon={<Icon>close</Icon>}>
          Remove Window
        </Button>
        <div className="flex-child" />
        <Button buttonStyle="text" onClick={closeDialog}>Close</Button>
      </>}>
      <div className="flex-column" style={{ width: 360, gap: 16 }}>
        {Object.values(Page).map(value =>
          <Button key={value} buttonStyle={usedPages.has(value) ? "outlined" : "elevated"} disabled={realPage === value} onClick={() => { setPage(value); closeDialog(); }}>{value}</Button>)}
      </div>
    </Dialog>
  </>;
}
