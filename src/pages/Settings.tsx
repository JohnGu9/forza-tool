import React from "react";
import { Button, Dialog } from "rmcw/dist/components3";
import { ReactAppContext, UnitSystem } from "../common/AppContext";
import ErrorMessage from "./ErrorMessage";

export default function Settings({ opened, close, errorCollection }: {
  opened: boolean;
  close: () => unknown;
  errorCollection: string[];
}) {
  const { resetData,
    enableDarkTheme, setEnableDarkTheme,
    unitSystem, setUnitSystem, } = React.useContext(ReactAppContext);

  const [isOpenErrorMessage, setOpenErrorMessage] = React.useState(false);
  const closeErrorMessage = React.useCallback(() => setOpenErrorMessage(false), []);
  return <>
    <Dialog open={opened && !isOpenErrorMessage}
      onScrimClick={close}
      onEscapeKey={close}
      headline="Settings"
      actions={<Button buttonStyle='text' onClick={close}>Close</Button>}>
      <div style={{ width: 360, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 8 }} aria-hidden />
        <Button onClick={resetData}>Reset Data</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button onClick={() => localStorage.clear()}>Reset Localstorage</Button>
        <div style={{ height: 32 }} aria-hidden />
        <Button onClick={() => setEnableDarkTheme(getNextThemeStats(enableDarkTheme))}>Theme: {getThemeName(enableDarkTheme)}</Button>
        <div style={{ height: 16 }} aria-hidden />
        <Button onClick={() => setUnitSystem(getNextUnitSystem(unitSystem))}>UnitSystem: {getUnitSystemName(unitSystem)}</Button>
        <div style={{ height: 32 }} aria-hidden />
        <Button onClick={() => setOpenErrorMessage(true)}>Error Message</Button>
        {/* <div style={{ height: 16 }} aria-hidden />
         <Button onClick={() => log("Test")}>Test</Button> */}
      </div>
    </Dialog>
    <ErrorMessage opened={isOpenErrorMessage} close={closeErrorMessage} errorCollection={errorCollection} />
  </>;
}

function getUnitSystemName(unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.International:
      return "International";
    case UnitSystem.Imperial:
      return "Imperial";
  }
}

function getNextUnitSystem(unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.International:
      return UnitSystem.Imperial;
    case UnitSystem.Imperial:
      return UnitSystem.International;
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
