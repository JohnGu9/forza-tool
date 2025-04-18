import React from "react";
import { Button, Dialog, ListItem, Switch, TextField } from "rmcw/dist/components3";

import { ListenAddress, ReactAppContext } from "../common/AppContext";
import { SocketState } from "../common/SocketState";

export default function Network({ opened, close }: {
  opened: boolean;
  close: () => unknown;
}) {
  const { listenAddress, setListenAddress, dataBufferLength, setDataBufferLength, socketStats } = React.useContext(ReactAppContext);
  const [address, port, forwardSwitch, forwardAddress, forwardPort, stamp] = listenAddress;
  const [newAddress, setNewAddress] = React.useState(address);
  const [newPort, setNewPort] = React.useState(port);
  const [forward, setForward] = React.useState(forwardSwitch);
  const [newForwardAddress, setNewForwardAddress] = React.useState(forwardAddress);
  const [newForwardPort, setNewForwardPort] = React.useState(forwardPort);
  const [newDataBufferLength, setNewDataBufferLength] = React.useState(dataBufferLength.toFixed(0));
  React.useEffect(() => {
    if (opened) {
      setForward(forwardSwitch);
    }
  }, [opened, forwardSwitch]);

  const currentForwarding = forwardSwitch ? `${forwardAddress}:${forwardPort}` : "off";

  return <Dialog open={opened}
    onScrimClick={close}
    onEscapeKey={close}
    headline="Network"
    actions={<>
      <Button buttonStyle="text" onClick={close}>Cancel</Button>
      <Button buttonStyle="text" onClick={() => {
        close();
        setListenAddress([newAddress, newPort, forward, newForwardAddress, newForwardPort, stamp]);
        setDataBufferLength(parseInt(newDataBufferLength));
      }}>Submit</Button>
    </>}>
    <div className="flex-column" style={{ width: 360 }}>
      <TextField type="text" label="Address" required value={newAddress} onChange={e => setNewAddress(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <TextField type="number" min="1" max="65535" label="Port" required value={newPort} onChange={e => setNewPort(e.target.value)}
        supportingText={getSocketInformation(socketStats, address, port)} />
      <div style={{ height: 16 }} aria-hidden />
      <ListItem type="button" supportingText="Send all received data to another port" trailingSupportingText={<Switch selected={forward}></Switch>} onClick={() => setForward(!forward)}>Forward</ListItem>
      <div style={{ height: 16 }} aria-hidden />
      <TextField disabled={!forward} type="text" label="Forward Address" value={newForwardAddress} onChange={e => setNewForwardAddress(e.target.value)} />
      <div style={{ height: 16 }} aria-hidden />
      <TextField disabled={!forward} type="number" label="Forward Port" value={newForwardPort} onChange={e => setNewForwardPort(e.target.value)}
        supportingText={`Current forwarding: ${currentForwarding}`} />
      <div style={{ height: 16 }} aria-hidden />
      <TextField type="number" min="1" label="Data Buffer Length" value={newDataBufferLength} onChange={e => setNewDataBufferLength(e.target.value)}
        supportingText={`Determines how much data is displayed in the charts. More data will consume more compute resource. Current: ${dataBufferLength}. (Recommend: 200 ~ 500)`} />
      <div style={{ height: 32 }} aria-hidden />
      <Button onClick={() => {
        const newValue = [...listenAddress] as ListenAddress;
        newValue[5] += 1;
        setListenAddress(newValue);
      }}>Reset Socket</Button>
    </div>
  </Dialog>;
}


function getSocketInformation(socketStats: SocketState, address: string, port: string) {
  switch (socketStats) {
    case SocketState.opening:
      return `Opening socket: ${address}:${port}`;
    case SocketState.opened:
      return `Current listening: ${address}:${port}`;
    case SocketState.error:
      return `Error socket: ${address}:${port} (Maybe port is occupied, please try another port)`;
    case SocketState.closed:
      return `Closed socket: ${address}:${port} (Socket is closed abnormally, please try resetting socket)`;
  }
}
