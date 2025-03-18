import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Select, SelectOption } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { UnitSystem } from "../common/UnitConvert";

export default function Motion() {
  const [option, setOption] = React.useState(Type.Acceleration);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { x, y, z } = getTargetData(messageData, option);
  const displayText = React.useMemo(() => capitalizeFirstLetter(option), [option]);
  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding: 16, gap: 16 }}>
    <Select label="option" displayText={displayText}>
      {Object.values(Type).map(key => <SelectOption key={key} headline={key} selected={option === key} onClick={() => setOption(key as Type)} style={{ textTransform: "capitalize" }} />)}
    </Select>
    <div className="flex-child flex-column" style={{ gap: 16 }}>
      <SimpleCard title={`${displayText} X`} data={x} type={option} />
      <SimpleCard title={`${displayText} Y`} data={y} type={option} />
      <SimpleCard title={`${displayText} Z`} data={z} type={option} />
    </div>
  </div>;
}

enum Type {
  Acceleration = "acceleration",
  Velocity = "velocity",
  AngularVelocity = "angularVelocity",
  AngularVelocityGlobal = "angularVelocityGlobal",
  Position = "position",
};

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, type: Type) {
  const length = messageData.getElementCount();
  const x = new Array<DataType>(length);
  const y = new Array<DataType>(length);
  const z = new Array<DataType>(length);

  function getKeys() {
    switch (type) {
      case Type.AngularVelocityGlobal:
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
    index++;
  }
  return { x, y, z };
}


function SimpleCard({ title, data, type }: { title: string, data: DataType[]; type: Type; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1].value);
  function formatter(value: number) {
    switch (type) {
      case Type.Acceleration:
      case Type.Velocity:
      case Type.Position: {
        switch (unitSystem) {
          case UnitSystem.Imperial:
            return `${(value * 2.23694).toFixed(1)} MPH`;
        }
        return `${(value * 3.6).toFixed(1)} KM/H`;
      }
      case Type.AngularVelocity:
      case Type.AngularVelocityGlobal:
        return `${value.toFixed(3)} RPS`;
    }

  }

  return <Card className="flex-child flex-column" style={{ alignItems: "stretch", padding: 16 }}>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -42, bottom: -16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="value" domain={([min, max]) => {
            const range = Math.max(Math.abs(min), Math.abs(max));
            return [-range, range];
          }} ticks={[0]} />
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
