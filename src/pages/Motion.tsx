import React from "react";
import { Card, Select, SelectOption } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { getSpeedUnit, msTo } from "../common/UnitConvert";
import { MotionOption, ReactWindowContext } from "./common/Context";
import { OptionDataValue, useEcharts } from "./common/Echarts";

export default function Motion() {
  const { padding, motionOption, setMotionOption } = React.useContext(ReactWindowContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { x, y, z, scalar } = getTargetData(messageData, motionOption);
  const displayText = React.useMemo(() => capitalizeFirstLetter(motionOption), [motionOption]);
  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding, gap: 16 }}>
    <Select label="option" displayText={displayText}>
      {Object.values(MotionOption).map(key => <SelectOption key={key} headline={key} selected={motionOption === key} onClick={() => setMotionOption(key as MotionOption)} style={{ textTransform: "capitalize" }} />)}
    </Select>
    <div className="flex-child flex-column" style={{ gap: 16 }}>
      <SimpleCard title="Axis X" data={x} type={motionOption} />
      <SimpleCard title="Axis Y" data={y} type={motionOption} />
      <SimpleCard title="Axis Z" data={z} type={motionOption} />
      <SimpleCard title="Scalar" data={scalar} type={motionOption} yAxis={{
        type: 'value',
        min: 0,
        max: (value: { max: number; }) => { return value.max * 1.05; },
        axisLabel: {
          formatter: (value: number) => {
            return (value as number).toFixed(0);
          },
        },
      }} />
    </div>
  </div>;
}


type DataType = [number, number];

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
    x[index] = [index, data[keys.x as "accelerationX"]];
    y[index] = [index, data[keys.y as "accelerationY"]];
    z[index] = [index, data[keys.z as "accelerationZ"]];
    scalar[index] = [index, Math.pow(Math.pow(x[index][1], 2) + Math.pow(y[index][1], 2) + Math.pow(z[index][1], 2), 1 / 2)];
    index++;
  }
  return { x, y, z, scalar };
}

function SimpleCard({ title, data, type, yAxis }: { title: string, data: DataType[], type: MotionOption, yAxis?: unknown, }) {
  const value = data.length === 0 ? 0 : data[data.length - 1][1];
  const { unitSystem } = React.useContext(ReactAppContext);

  function formatter(value: OptionDataValue | OptionDataValue[]) {
    switch (type) {
      case MotionOption.Acceleration:
        return `${(value as number).toFixed(3)} m/s²`;
      case MotionOption.Velocity:
        return `${msTo(value as number, unitSystem).toFixed(3)} ${getSpeedUnit(unitSystem)}`;
      case MotionOption.AngularVelocity:
      case MotionOption.AngularVelocityGlobal:
        return `${(value as number).toFixed(3)} RPS`;
      case MotionOption.Position:
        return `${(value as number).toFixed(3)} m`;
    }
  }
  const ref = useEcharts<HTMLDivElement>({
    grid: {
      left: 32,
      top: 8,
      right: 0,
      bottom: 8
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      valueFormatter: formatter
    },
    yAxis: yAxis ?? {
      type: 'value',
      min: ({ min }) => { return min; },
      max: ({ max }) => { return max; },
      axisLabel: {
        formatter: (value) => {
          return (value as number).toFixed(1);
        },
      },
    },
    series: [
      {
        data: data,
        type: 'line',
        areaStyle: {
          opacity: 0.6,
        },
        symbolSize: 0,
      },
    ],
  });

  return <Card className="flex-child flex-column" style={{ alignItems: "stretch", padding: "8px 16px" }}>
    <div ref={ref} className="flex-child" style={{ overflow: "clip" }}>
    </div>
    <div className="flex-row flex-space-between">
      <span>{title}</span>{formatter(value)}
    </div>
  </Card>;
}
