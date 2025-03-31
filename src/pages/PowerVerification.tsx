import React from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { Card } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { getPowerUnit, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";

export default function PowerVerification() {
  const { padding } = React.useContext(ReactWindowContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { unitSystem } = React.useContext(ReactAppContext);
  const { power, diffPower, diff } = getTargetData(messageData, unitSystem);
  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding, gap: 16 }}>
    <Card className="flex-child" style={{ flex: "3 3", padding: "8px 16px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={power} margin={{ top: 16, right: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="Power" />
          <YAxis dataKey="Torque * RPM" />
          <Tooltip contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }}
            formatter={(value) => { return `${(value as number).toFixed(3)} ${getPowerUnit(unitSystem)}`; }} />
          <Legend />
          <Area type="monotone" dataKey="Torque * RPM" stroke="var(--md-sys-color-primary)" fillOpacity={0.2} fill="var(--md-sys-color-primary)" isAnimationActive={false} />
          <Area type="monotone" dataKey="Power" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
    <SimpleCard title="Power - (Torque * RPM)" data={diffPower} />
    <SimpleCard title="Power / (Torque * RPM)" data={diff}
      ticks={[1]}
      domain={([min, max]) => {
        return [Math.min(0.95, min), Math.max(1.05, max)];
      }}
      formatter={value => `${(value * 100).toFixed(3)} %`} />
  </div>;
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, unitSystem: UnitSystem) {
  const length = messageData.getElementCount();
  const power = new Array<{ index: number, ["Power"]: number, ["Torque * RPM"]: number; }>(length);
  const diffPower = new Array<DataType>(length);
  const diff = new Array<DataType>(length);
  let index = 0;
  for (const data of messageData) {
    power[index] = { index, ["Power"]: wTo(data.power, unitSystem), ["Torque * RPM"]: wTo(1000 * data.torque * data.currentEngineRpm / 9550, unitSystem) };
    diffPower[index] = { index, value: power[index]["Power"] - power[index]["Torque * RPM"] };
    diff[index] = { index, value: power[index]["Power"] / power[index]["Torque * RPM"] };
    index++;
  }
  return { power, diffPower, diff };
}

function SimpleCard({ title, data, domain, ticks, formatter }: { title: string, data: DataType[], domain?: AxisDomain, ticks?: (string | number)[], formatter?: ((value: number) => string); }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const value = data.length === 0 ? 0 : data[data.length - 1].value;
  function defaultFormatter(value: number) {
    return `${value.toFixed(3)} ${getPowerUnit(unitSystem)}`;
  }
  formatter ??= defaultFormatter;
  return <Card className="flex-child flex-column" style={{ alignItems: "stretch", padding: "8px 16px" }}>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -42, bottom: -16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="value" domain={domain} ticks={ticks ?? [0]} />
          <Tooltip formatter={(value) => { return formatter(value as number); }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Area type="monotone" dataKey="value" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="flex-row flex-space-between">
      <span>{title}</span>{formatter(value)}
    </div>
  </Card>;
}
