import { Select, SelectOption } from "rmcw/dist/components3";
import { dummyMessageData, MessageData } from "../common/MessageData";
import React from "react";
import useResize, { sizeToKey } from "../hooks/resize";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ReactStreamAppContext } from "../common/AppContext";

const keys = Object.keys(dummyMessageData).filter(value => {
  switch (value) {
    case "isDashData":
    case "isRaceOn":
      return false;
    default:
      return true;
  }
});

export default function Detail() {
  const [option, setOption] = React.useState(keys[0]);
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const data = messageData.map((data, index) => { return { index, value: data[option as keyof MessageData] }; });
  const lastData = messageData.getLast();
  const currentDataType = lastData ? (lastData.isDashData ? "Dash" : "Sled") : "unknown";
  return <div className="fill-parent flex-column" style={{ padding: "16px 32px" }}>
    <Select label="option" displayText={option} supportingText={`Current Data Type: ${currentDataType}`}>
      {keys.map(key => <SelectOption key={key} headline={key} selected={option === key} onClick={() => setOption(key)} />)}
    </Select>
    <div style={{ height: 16 }} aria-hidden />
    <div ref={ref} style={{ flexGrow: "1", width: "100%", overflow: "hidden" }}>
      <LineChart key={sizeToKey(size)} width={size.width} height={size.height} data={data}
        margin={{ top: 16, right: 2, left: -10, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="index" type="number" hide />
        <YAxis domain={([dataMin, dataMax]) => { return [dataMin, dataMax]; }} tickFormatter={value => value.toFixed(1)} />
        <Tooltip formatter={(value) => { return (value as number).toFixed(6); }}
          contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" dot={false}/>
      </LineChart>
    </div>
  </div>;
}
