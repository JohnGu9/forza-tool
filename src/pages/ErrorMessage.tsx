import React from "react";
import { Button, Dialog } from "rmcw/dist/components3";

import { ReactAppContext } from "../common/AppContext";

export default function ErrorMessage({ opened, close }: {
  opened: boolean;
  close: () => unknown;
}) {
  const { errorMessage, setErrorMessage } = React.useContext(ReactAppContext);
  return <Dialog open={opened}
    onScrimClick={close}
    onEscapeKey={close}
    headline="Error"
    actions={<>
      <Button buttonStyle="text" onClick={() => setErrorMessage([])} disabled={errorMessage.length === 0}>Clear</Button>
      <Button buttonStyle="text" onClick={close}>Close</Button>
    </>}>
    {errorMessage.length === 0 ?
      <div>No error message yet. </div> :
      errorMessage.map((errorMessage, index) => <div key={index}>{errorMessage}</div>)}
  </Dialog>;
}
