import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ListItem, Select, SelectOption, Switch } from "rmcw/dist/components3";

import { ReactStreamAppContext, ReactWindowContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { dummyMessageData, MessageData } from "../common/MessageData";

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
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { detailOption, setDetailOption, showDetailDelta, setShowDetailDelta } = React.useContext(ReactWindowContext);
  const data = showDetailDelta ?
    getDelta(messageData, detailOption as keyof MessageData) :
    messageData.map((data, index) => { return { index, value: data[detailOption as keyof MessageData] }; });
  const lastData = messageData.getLast();
  const currentDataType = lastData ? (lastData.isDashData ? "Dash" : "Sled") : "unknown";
  const displayText = React.useMemo(() => capitalizeFirstLetter(detailOption), [detailOption]);
  return <div className="fill-parent flex-column" style={{ padding: "16px 16px 0" }}>
    <Select label="option" displayText={displayText} supportingText={`Current Data Type: ${currentDataType}`}>
      {keys.map(key => <SelectOption key={key} headline={key} selected={detailOption === key} onClick={() => setDetailOption(key)} style={{ textTransform: "capitalize" }} />)}
    </Select>
    <div style={{ height: 16 }} aria-hidden />
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}
          margin={{ top: 16, right: 2, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" hide />
          <YAxis type="number" domain={([min, max]) => [min, max]} tickFormatter={value => value.toFixed(1)} />
          <Tooltip formatter={(value) => (value as number).toFixed(6)}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Line type="monotone" dataKey="value" stroke="var(--md-sys-color-tertiary)" dot={false} animationDuration={350} strokeLinecap="round" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <ListItem type="button" end={<Switch selected={showDetailDelta} />} onClick={() => setShowDetailDelta(!showDetailDelta)}>Show Delta</ListItem>
  </div>;
}

function getDelta<T extends keyof MessageData>(messageData: CircularBuffer<MessageData>, option: T) {
  const lower = messageData.getLowerBound();
  const upper = messageData.getUpperBound();
  if ((upper - lower) < 2) {
    return [];
  }
  const res = new Array<{ index: number, value: number; }>(upper - lower - 1);
  for (let index = lower, i = 0; index < (upper - 1); index++, i++) {
    const data0 = messageData.getUnsafe(index);
    const data1 = messageData.getUnsafe(index + 1);
    const value0 = data0[option] as number;
    const value1 = data1[option] as number;
    res[i] = { index: i, value: (value1 - value0) };
  }
  return res;
}
