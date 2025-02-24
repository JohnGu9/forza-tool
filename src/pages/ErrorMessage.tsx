import { Button, Dialog } from "rmcw/dist/components3";

export default function ErrorMessage({ opened, close, errorCollection }: {
  opened: boolean;
  close: () => unknown;
  errorCollection: string[];
}) {
  return <Dialog open={opened}
    onScrimClick={close}
    onEscapeKey={close}
    headline="Error"
    actions={<Button buttonStyle='text' onClick={close}>Close</Button>}>
    {errorCollection.length === 0 ?
      <div>No Error Message Yet. </div> :
      errorCollection.map((errorMessage, index) => <div key={index}>{errorMessage}</div>)}
  </Dialog>;
}
