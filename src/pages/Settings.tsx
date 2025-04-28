import React from "react";
import { Button, Dialog, Icon } from "rmcw/dist/components3";

import { AppWindowMode, ReactAppContext, WindowZIndex } from "../common/AppContext";
import { getUnitSystemName, UnitSystem } from "../common/UnitConvert";
import ErrorMessage from "./ErrorMessage";

export default function Settings({ opened, close }: {
  opened: boolean;
  close: () => unknown;
}) {
  const { resetData, errorMessage,
    enableDarkTheme, setEnableDarkTheme,
    unitSystem, setUnitSystem,
    appWindowMode, setAppWindowMode,
    windowZIndex, setWindowZIndex, } = React.useContext(ReactAppContext);

  const [isOpenErrorMessage, setOpenErrorMessage] = React.useState(false);
  const closeErrorMessage = React.useCallback(() => setOpenErrorMessage(false), []);

  return <>
    <Dialog open={opened && !isOpenErrorMessage}
      onScrimClick={close}
      onEscapeKey={close}
      headline="Settings"
      actions={<Button buttonStyle="text" onClick={close}>Close</Button>}>
      <div className="flex-column" style={{ width: 360 }}>
        <div style={{ height: 8 }} aria-hidden />
        <Button icon={<Icon>grid_view</Icon>} onClick={() => setAppWindowMode(getNextWindowMode(appWindowMode))}>Switch to {getNextWindowModeName(appWindowMode)}</Button>
        <div style={{ height: 32 }} aria-hidden />

        <Button icon={<Icon>clear_all</Icon>} onClick={resetData}>Clear Data</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button icon={<Icon>medical_services</Icon>} onClick={() => localStorage.clear()}>Clear Cache</Button>
        <div style={{ height: 32 }} aria-hidden />

        <Button icon={<Icon>contrast</Icon>} onClick={() => setEnableDarkTheme(getNextThemeStats(enableDarkTheme))}>Theme: {getThemeName(enableDarkTheme)}</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button icon={<Icon>straighten</Icon>} onClick={() => setUnitSystem(getNextUnitSystem(unitSystem))}>UnitSystem: {getUnitSystemName(unitSystem)}</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button icon={<Icon>layers</Icon>} onClick={() => setWindowZIndex(getNextWindowZIndex(windowZIndex))}>Window Z Index: {windowZIndex}</Button>
        <div style={{ height: 32 }} aria-hidden />

        <Button icon={<Icon>error</Icon>} onClick={() => setOpenErrorMessage(true)}>Error ({errorMessage.length})</Button>
        {/* <div style={{ height: 16 }} aria-hidden />
         <Button onClick={() => log("Test")}>Test</Button> */}
      </div>
    </Dialog>
    <ErrorMessage opened={isOpenErrorMessage} close={closeErrorMessage} />
  </>;
}

function getNextWindowMode(mode: AppWindowMode) {
  switch (mode) {
    case AppWindowMode.Single:
      return AppWindowMode.Multi;
    case AppWindowMode.Multi:
      return AppWindowMode.Single;
  }
}

function getNextWindowModeName(mode: AppWindowMode) {
  switch (mode) {
    case AppWindowMode.Single:
      return "Multi Window";
    case AppWindowMode.Multi:
      return "Single Window";
  }
}

function getNextUnitSystem(unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.Metric:
      return UnitSystem.Imperial;
    case UnitSystem.Imperial:
      return UnitSystem.Metric;
  }
}

function getThemeName(enableDarkTheme: boolean | undefined) {
  switch (enableDarkTheme) {
    case undefined:
      return "Auto";
    case false:
      return "Light";
    case true:
      return "Dark";
  }
}

function getNextThemeStats(enableDarkTheme: boolean | undefined) {
  switch (enableDarkTheme) {
    case undefined:
      return false;
    case false:
      return true;
    case true:
      return undefined;
  }
}

function getNextWindowZIndex(windowZIndex: WindowZIndex) {
  switch (windowZIndex) {
    case WindowZIndex.None:
      return WindowZIndex.Top;
    case WindowZIndex.Top:
      return WindowZIndex.Bottom;
    case WindowZIndex.Bottom:
      return WindowZIndex.None;
  }
}
