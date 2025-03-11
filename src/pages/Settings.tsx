import React from "react";
import { Button, Dialog } from "rmcw/dist/components3";
import { AppWindowMode, ReactAppContext } from "../common/AppContext";
import ErrorMessage from "./ErrorMessage";
import { getUnitSystemName, UnitSystem } from "../common/UnitConvert";

export default function Settings({ opened, close }: {
  opened: boolean;
  close: () => unknown;
}) {
  const { resetData, errorMessage,
    enableDarkTheme, setEnableDarkTheme,
    unitSystem, setUnitSystem,
    appWindowMode, setAppWindowMode } = React.useContext(ReactAppContext);

  const [isOpenErrorMessage, setOpenErrorMessage] = React.useState(false);
  const closeErrorMessage = React.useCallback(() => setOpenErrorMessage(false), []);

  return <>
    <Dialog open={opened && !isOpenErrorMessage}
      onScrimClick={close}
      onEscapeKey={close}
      headline="Settings"
      actions={<Button buttonStyle='text' onClick={close}>Close</Button>}>
      <div className="flex-column" style={{ width: 360 }}>
        <div style={{ height: 8 }} aria-hidden />
        <Button onClick={() => setAppWindowMode(getNextWindowMode(appWindowMode))}>Switch to {getNextWindowModeName(appWindowMode)}</Button>
        <div style={{ height: 32 }} aria-hidden />

        <Button onClick={resetData}>Reset Data</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button onClick={() => localStorage.clear()}>Reset Localstorage</Button>
        <div style={{ height: 32 }} aria-hidden />

        <Button onClick={() => setEnableDarkTheme(getNextThemeStats(enableDarkTheme))}>Theme: {getThemeName(enableDarkTheme)}</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button onClick={() => setUnitSystem(getNextUnitSystem(unitSystem))}>UnitSystem: {getUnitSystemName(unitSystem)}</Button>
        <div style={{ height: 32 }} aria-hidden />
        <Button onClick={() => setOpenErrorMessage(true)}>Error Message ({errorMessage.length})</Button>
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
