import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, LinearProgress } from "rmcw/dist/components3";
import useResize, { sizeToKey } from "../hooks/resize";
import React from "react";
import { ReactStreamAppContext } from "../common/AppContext";

export default function Control() {
  const { messageData } = React.useContext(ReactStreamAppContext);
  return <div className="fill-parent flex-column" style={{ padding: "16px 32px" }}>
    <SimpleCard title="Clutch" data={messageData.map((value, index) => { return { index, value: value.clutch / 255 * 100 }; })} />
    <div style={{ height: 16 }} aria-hidden />
    <SimpleCard title="Accelerator" data={messageData.map((value, index) => { return { index, value: value.accelerator / 255 * 100 }; })} />
    <div style={{ height: 16 }} aria-hidden />
    <SimpleCard title="Brake" data={messageData.map((value, index) => { return { index, value: value.brake / 255 * 100 }; })} />
    <div style={{ height: 16 }} aria-hidden />
    <SimpleCard title="Handbrake" data={messageData.map((value, index) => { return { index, value: value.handbrake / 255 * 100 }; })} />
  </div>;
}

function SimpleCard({ title, data }: { title: string, data: { index: number; value: number; }[]; }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1].value);
  return <Card className="flex-column" style={{ flexGrow: "1", height: "100%", justifyContent: "space-evenly", alignItems: "center", padding: 16 }}>
    <div ref={ref} style={{ flexGrow: "1", width: "100%", overflow: "hidden" }}>
      <AreaChart key={sizeToKey(size)} width={size.width} height={size.height} data={data}
        margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
        <defs>
          <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="index" type="number" tick={false} />
        <YAxis yAxisId={1} domain={[0, 50, 100]} ticks={[0, 100]} />
        <Tooltip formatter={(value) => { return `${(value as number).toFixed(1)}%`; }}
          contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
        <Area yAxisId={1} type="monotone" dataKey="value" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPower)" />
      </AreaChart>
    </div>
    <div className="flex-row" style={{ width: "100%", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span>{title}</span>{(value).toFixed(1)}%
    </div>
    <LinearProgress value={value / 100} style={{ width: "100%" }} />
  </Card>;
}
