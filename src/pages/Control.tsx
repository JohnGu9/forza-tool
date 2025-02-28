import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, LinearProgress } from "rmcw/dist/components3";
import React from "react";
import { ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";

const gridTemplateAreas =
  `'Accelerator Accelerator'
'Accelerator Accelerator'
'Brake Brake'
'Brake Brake'
'Clutch Handbrake'
'Clutch Handbrake'
'Clutch Handbrake'
`;

export default function Control() {
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { clutch, accelerator, brake, handbrake } = getTargetData(messageData);
  return <div className="fill-parent flex-column" style={{
    padding: "16px 32px", gap: 16,
    display: "grid", gridTemplateAreas,
  }}>
    <SimpleCard title="Accelerator" data={accelerator} />
    <SimpleCard title="Brake" data={brake} />
    <SimpleCard title="Clutch" data={clutch} />
    <SimpleCard title="Handbrake" data={handbrake} />
  </div>;
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>) {
  let index = 0;
  const length = messageData.getElementCount();
  const clutch = new Array<DataType>(length);
  const accelerator = new Array<DataType>(length);
  const brake = new Array<DataType>(length);
  const handbrake = new Array<DataType>(length);
  for (const data of messageData) {
    clutch[index] = { index, value: data.clutch / 255 * 100 };
    accelerator[index] = { index, value: data.accelerator / 255 * 100 };
    brake[index] = { index, value: data.brake / 255 * 100 };
    handbrake[index] = { index, value: data.handbrake / 255 * 100 };
    index += 1;
  }
  return { clutch, accelerator, brake, handbrake };
}

function SimpleCard({ title, data }: { title: string, data: DataType[]; }) {
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1].value);
  return <Card className="flex-column flex-space-evenly" style={{ gridArea: title, minHeight: 0, minWidth: 0, padding: 16 }}>
    <div style={{ flex: "1 1", width: "100%", overflow: "hidden" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}
          margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
          <defs>
            <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} />
          <YAxis domain={[0, 50, 100]} ticks={[0, 100]} />
          <Tooltip formatter={(value) => { return `${(value as number).toFixed(1)}%`; }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Area type="monotone" dataKey="value" stroke="#82ca9d" fillOpacity={1} fill={`url(#color${title})`} animationDuration={650} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="flex-row" style={{ width: "100%", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span>{title}</span>{(value).toFixed(1)}%
    </div>
    <LinearProgress value={value / 100} style={{ width: "100%", "--rmcw-linear-progress-transition": "none" } as React.CSSProperties} />
  </Card>;
}
