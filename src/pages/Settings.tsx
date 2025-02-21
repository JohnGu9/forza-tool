import React from "react";
import { Button, Dialog, TextField, Typography } from "rmcw/dist/components3";
import { ReactAppContext, UnitSystem } from "../common/AppContext";

export default function Settings({ opened, close }: {
  opened: boolean;
  close: () => unknown;
}) {
  const { listenAddress, setListenAddress,
    enableDarkTheme, setEnableDarkTheme,
    unitSystem, setUnitSystem } = React.useContext(ReactAppContext);
  const [address, port] = listenAddress;
  const [newAddress, setNewAddress] = React.useState(address);
  const [newPort, setNewPort] = React.useState(port);
  return <Dialog open={opened}
    onScrimClick={close}
    onEscapeKey={close}
    headline="Settings"
    actions={<>
      <Button buttonStyle='text' onClick={close}>Cancel</Button>
      <Button buttonStyle='text' onClick={() => {
        close();
        setListenAddress([newAddress, newPort, listenAddress[2]]);
      }}>Submit</Button>
    </>}>
    <div style={{ width: 360, display: "flex", flexDirection: "column" }}>
      <TextField style={{ width: "100%" }} type="text" label="Address" required value={newAddress} onChange={async e => setNewAddress(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <TextField style={{ width: "100%" }} type="number" label="Port" required value={newPort} onChange={async e => setNewPort(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <Typography.Label.Small tag='div' style={{ padding: "0 16px" }}>Current listening: {address}:{port}</Typography.Label.Small>
      <div style={{ height: 32 }} aria-hidden />
      <Button onClick={() => setListenAddress([listenAddress[0], listenAddress[1], listenAddress[2] + 1])}>Reset Socket</Button>
      <div style={{ height: 16 }} aria-hidden />
      <Button onClick={() => localStorage.clear()}>Reset Localstorage</Button>
      <div style={{ height: 16 }} aria-hidden />
      <Button onClick={() => setUnitSystem(getNextUnitSystem(unitSystem))}>UnitSystem: {getUnitSystemName(unitSystem)}</Button>
      <div style={{ height: 16 }} aria-hidden />
      <Button onClick={() => setEnableDarkTheme(getNextThemeStats(enableDarkTheme))}>Theme: {getThemeName(enableDarkTheme)}</Button>
      {/* <div style={{ height: 16 }} aria-hidden />
      <Button onClick={() => log("Test")}>Test</Button> */}
    </div>
  </Dialog>;
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
