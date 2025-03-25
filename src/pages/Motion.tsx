import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { Card, Select, SelectOption } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { getSpeedUnit, msTo } from "../common/UnitConvert";
import { MotionOption, ReactPageContext } from "./common/Context";

export default function Motion() {
  const { motionOption, setMotionOption } = React.useContext(ReactPageContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { x, y, z, scalar } = getTargetData(messageData, motionOption);
  const displayText = React.useMemo(() => capitalizeFirstLetter(motionOption), [motionOption]);
  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding: 16, gap: 16 }}>
    <Select label="option" displayText={displayText}>
      {Object.values(MotionOption).map(key => <SelectOption key={key} headline={key} selected={motionOption === key} onClick={() => setMotionOption(key as MotionOption)} style={{ textTransform: "capitalize" }} />)}
    </Select>
    <div className="flex-child flex-column" style={{ gap: 16 }}>
      <SimpleCard title="Axis X" data={x} type={motionOption} />
      <SimpleCard title="Axis Y" data={y} type={motionOption} />
      <SimpleCard title="Axis Z" data={z} type={motionOption} />
      <SimpleCard title="Scalar" data={scalar} type={motionOption} domain={(([, max]) => [0, max * 1.05])} />
    </div>
  </div>;
}


type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, type: MotionOption) {
  const length = messageData.getElementCount();
  const x = new Array<DataType>(length);
  const y = new Array<DataType>(length);
  const z = new Array<DataType>(length);
  const scalar = new Array<DataType>(length);

  function getKeys() {
    switch (type) {
      case MotionOption.AngularVelocityGlobal:
        return { x: "pitch", y: "yaw", z: "roll" };
      default:
        return { x: `${type}X`, y: `${type}Y`, z: `${type}Z` };
    }
  }
  const keys = getKeys();
  let index = 0;
  for (const data of messageData) {
    x[index] = { index, value: data[keys.x as "accelerationX"] };
    y[index] = { index, value: data[keys.y as "accelerationY"] };
    z[index] = { index, value: data[keys.z as "accelerationZ"] };
    scalar[index] = { index, value: Math.pow(Math.pow(x[index].value, 2) + Math.pow(y[index].value, 2) + Math.pow(z[index].value, 2), 1 / 2) };
    index++;
  }
  return { x, y, z, scalar };
}

const defaultDomain: AxisDomain = ([min, max]: [number, number]) => {
  const range = Math.max(Math.abs(min), Math.abs(max));
  return [-range, range];
};

function SimpleCard({ title, data, type, domain }: { title: string, data: DataType[]; type: MotionOption; domain?: AxisDomain, }) {
  const value = data.length === 0 ? 0 : data[data.length - 1].value;
  const { unitSystem } = React.useContext(ReactAppContext);

  function formatter(value: number) {
    switch (type) {
      case MotionOption.Acceleration:
        return `${value.toFixed(1)} m/s²`;
      case MotionOption.Velocity:
        return `${msTo(value, unitSystem).toFixed(1)} ${getSpeedUnit(unitSystem)}`;
      case MotionOption.AngularVelocity:
      case MotionOption.AngularVelocityGlobal:
        return `${value.toFixed(3)} RPS`;
      case MotionOption.Position:
        return `${value.toFixed(1)} m`;
    }
  }

  return <Card className="flex-child flex-column" style={{ alignItems: "stretch", padding: 16 }}>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -42, bottom: -16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="value" domain={domain ?? defaultDomain} ticks={[0]} />
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
