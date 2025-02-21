import React from "react";
import { Button, Dialog, ListItem, Switch, TextField, Typography } from "rmcw/dist/components3";
import { ListenAddress, ReactAppContext } from "../common/AppContext";

export default function Network({ opened, close }: {
  opened: boolean;
  close: () => unknown;
}) {
  const { listenAddress, setListenAddress } = React.useContext(ReactAppContext);
  const [address, port, forwardSwitch, forwardAddress, forwardPort, stamp] = listenAddress;
  const [newAddress, setNewAddress] = React.useState(address);
  const [newPort, setNewPort] = React.useState(port);
  const [forward, setForward] = React.useState(forwardSwitch);
  const [newForwardAddress, setNewForwardAddress] = React.useState(forwardAddress);
  const [newForwardPort, setNewForwardPort] = React.useState(forwardPort);
  React.useEffect(() => {
    if (opened) {
      setForward(forwardSwitch);
    }
  }, [opened, forwardSwitch]);
  return <Dialog open={opened}
    onScrimClick={close}
    onEscapeKey={close}
    headline="Network"
    actions={<>
      <Button buttonStyle='text' onClick={close}>Cancel</Button>
      <Button buttonStyle='text' onClick={() => {
        close();
        setListenAddress([newAddress, newPort, forward, newForwardAddress, newForwardPort, stamp]);
      }}>Submit</Button>
    </>}>
    <div style={{ width: 360, display: "flex", flexDirection: "column" }}>
      <TextField style={{ width: "100%" }} type="text" label="Address" required value={newAddress} onChange={async e => setNewAddress(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <TextField style={{ width: "100%" }} type="number" label="Port" required value={newPort} onChange={async e => setNewPort(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <Typography.Label.Small tag='div' style={{ padding: "0 16px" }}>Current listening: {address}:{port}</Typography.Label.Small>
      <div style={{ height: 16 }} aria-hidden />
      <ListItem type="button" supportingText="Send all received data to another port" trailingSupportingText={<Switch selected={forward}></Switch>} onClick={() => setForward(!forward)}>Forward</ListItem>
      <div style={{ height: 16 }} aria-hidden />
      <TextField disabled={!forward} style={{ width: "100%" }} type="text" label="Forward Address" value={newForwardAddress} onChange={async e => setNewForwardAddress(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <TextField disabled={!forward} style={{ width: "100%" }} type="number" label="Forward Port" value={newForwardPort} onChange={async e => setNewForwardPort(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <Typography.Label.Small tag='div' style={{ padding: "0 16px" }}>Current forwarding: {forwardSwitch ? `${forwardAddress}:${forwardPort}` : "off"}</Typography.Label.Small>
      <div style={{ height: 32 }} aria-hidden />
      <Button onClick={() => {
        const newValue = [...listenAddress] as ListenAddress;
        newValue[5] += 1;
        setListenAddress(newValue);
      }}>Reset Socket</Button>
    </div>
  </Dialog>;
}

