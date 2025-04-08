import React from "react";
import { Card, LinearProgress, Select, SelectOption } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { getValidKeys, MessageData } from "../common/MessageData";
import { UnitSystem } from "../common/UnitConvert";
import { ReactWindowContext, TireOption } from "./common/Context";
import useEcharts from "./common/Echarts";

export default function Tire() {
  const { padding, tireOption, setTireOption } = React.useContext(ReactWindowContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { frontLeft, frontRight, rearLeft, rearRight } = getTargetData(messageData, tireOption);
  const displayText = React.useMemo(() => capitalizeFirstLetter(tireOption), [tireOption]);
  const lastData = messageData.getLast();
  const validKeys = getValidKeys(lastData?.dataType);
  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding }}>
    <Select label="option" displayText={displayText}>
      {Object.values(TireOption).map(key => <SelectOption key={key} headline={key} disabled={!validKeys.has(`${key}FrontLeft`)} selected={tireOption === key} onClick={() => setTireOption(key)} style={{ textTransform: "capitalize" }} />)}
    </Select>
    <div className="flex-child" style={{ display: "grid", gridTemplateColumns: "50% 50%", gridTemplateRows: "50% 50%", gap: "16px", padding: "16px 16px 16px 0" }}>
      <SimpleCard title="FrontLeft" data={frontLeft} option={tireOption} />
      <SimpleCard title="FrontRight" data={frontRight} option={tireOption} />
      <SimpleCard title="RearLeft" data={rearLeft} option={tireOption} />
      <SimpleCard title="RearRight" data={rearRight} option={tireOption} />
    </div>
  </div>;
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, option: TireOption) {
  const keyFrontLeft = `${option}FrontLeft`;
  const keyFrontRight = `${option}FrontRight`;
  const keyRearLeft = `${option}RearLeft`;
  const keyRearRight = `${option}RearRight`;

  const length = messageData.getElementCount();
  const frontLeft = new Array<DataType>(length);
  const frontRight = new Array<DataType>(length);
  const rearLeft = new Array<DataType>(length);
  const rearRight = new Array<DataType>(length);

  let index = 0;
  for (const data of messageData) {
    frontLeft[index] = { index, value: data[keyFrontLeft as "tireSlipAngleFrontLeft"] };
    frontRight[index] = { index, value: data[keyFrontRight as "tireSlipAngleFrontLeft"] };
    rearLeft[index] = { index, value: data[keyRearLeft as "tireSlipAngleFrontLeft"] };
    rearRight[index] = { index, value: data[keyRearRight as "tireSlipAngleFrontLeft"] };
    index++;
  }
  return { frontLeft, frontRight, rearLeft, rearRight };
}

function SimpleCard({ title, data, option }: { title: string, data: DataType[]; option: TireOption; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1].value);
  const { formatter, progress, min, max, getColor } = React.useMemo(() => getConfiguration(option, unitSystem), [option, unitSystem]);

  const ref = useEcharts<HTMLDivElement>({
    grid: {
      left: 56,
      top: 8,
      right: 0,
      bottom: 8
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      valueFormatter: formatter
    },
    yAxis: {
      type: 'value',
      min,
      max,
      axisLabel: {
        formatter,
      },
    },
    series: [
      {
        data: data.map(v => [v.index, v.value]),
        type: 'line',
        areaStyle: {},
        symbolSize: 0,
      },
    ],
  });
  return <Card className="flex-column flex-space-evenly" style={{ alignItems: "stretch", padding: 16 }}>
    <div ref={ref} className="flex-child" style={{ overflow: "clip" }}>
    </div>
    <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
      <span>{title}</span>{formatter(value)}
    </div>
    <LinearProgress className="only-color-transition"
      style={{ "--md-linear-progress-active-indicator-color": getColor(value) } as React.CSSProperties}
      value={progress(value)} />
  </Card>;
}

function getConfiguration(type: TireOption, unitSystem: UnitSystem): {
  formatter: (value: number) => string;
  min: ((value: { min: number, max: number; }) => number) | number;
  max: ((value: { min: number, max: number; }) => number) | number;
  progress: (value: number) => number;
  getColor: (value: number) => string | undefined,
} {
  function absMax(value: { min: number; max: number; }) {
    return Math.max(Math.abs(value.max), Math.abs(value.min));
  }
  switch (type) {
    case TireOption.SlipAngle:
    case TireOption.SlipRatio:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        min: (value: { min: number; max: number; }) => { return -absMax(value); },
        max: (value: { min: number; max: number; }) => { return absMax(value); },
        progress: (value: number) => Math.abs(value),
        getColor,
      };
    case TireOption.CombinedSlip:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        min: 0,
        max: (value: { min: number; max: number; }) => { return value.max; },
        progress: (value: number) => value,
        getColor,
      };
    case TireOption.TireWear:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        min: 0,
        max: 1,
        progress: (value: number) => value,
        getColor,
      };
    case TireOption.Temp: {
      function getColor(value: number) {
        if (value < 185) {
          return undefined;
        }
        if (value < 239) {
          return "var(--md-sys-color-tertiary)";
        }
        return "var(--md-sys-color-error)";
      }
      function progress(value: number) { return value / 239; }

      switch (unitSystem) {
        case UnitSystem.Imperial:
          return {
            formatter: (value: number) => `${value.toFixed(1)}°F`,
            min: ({ min }) => { return Math.min(min, 140); },
            max: ({ max }) => { return Math.max(max, 248); },
            progress,
            getColor,
          };
        default: {
          function toC(value: number) {
            return (value - 32) * 5 / 9;
          }
          return {
            formatter: (value: number) => `${toC(value).toFixed(1)}°C`,
            min: ({ min }) => { return Math.min(min, 140); },
            max: ({ max }) => { return Math.max(max, 248); },
            progress,
            getColor,
          };
        }
      }
    }
    case TireOption.WheelRotationSpeed:
      return {
        formatter: (value: number) => `${value.toFixed(1)} Radians/Sec`,
        min: (value: { min: number; max: number; }) => { return value.min; },
        max: (value: { min: number; max: number; }) => { return value.max; },
        progress: () => 0,
        getColor,
      };
    case TireOption.SurfaceRumble:
    case TireOption.WheelOnRumbleStrip:
    case TireOption.WheelInPuddleDepth:
    case TireOption.NormalizedSuspensionTravel:
    case TireOption.SuspensionTravelMeters:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        min: 0,
        max: 1,
        progress: (value: number) => value,
        getColor,
      };
  }
}

function getColor(value: number) {
  if (value < 1) {
    return undefined;
  }
  if (value < 1.6) {
    return "var(--md-sys-color-tertiary)";
  }
  return "var(--md-sys-color-error)";
}
