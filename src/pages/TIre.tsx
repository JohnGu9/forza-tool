import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { Card, LinearProgress, Select, SelectOption } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { getValidKeys, MessageData } from "../common/MessageData";
import { UnitSystem } from "../common/UnitConvert";
import { ReactWindowContext, TireOption } from "./common/Context";

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
  const { formatter, progress, domain, ticks } = React.useMemo(() => getConfiguration(option, unitSystem), [option, unitSystem]);

  function getColor(value: number) {
    if (value < 1) {
      return undefined;
    }
    if (value < 1.6) {
      return "var(--md-sys-color-tertiary)";
    }
    return "var(--md-sys-color-error)";
  }
  return <Card className="flex-column flex-space-evenly" style={{ alignItems: "stretch", padding: 16 }}>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -36, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" name="XAxis" domain={['dataMin', 'dataMax']} tick={false} />
          <YAxis domain={domain} ticks={ticks} />
          <Tooltip formatter={(value) => { return formatter(value as number); }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Area type="monotone" dataKey="value" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
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
  ticks: (string | number)[] | undefined;
  domain: AxisDomain | undefined;
  progress: (value: number) => number;
} {
  switch (type) {
    case TireOption.SlipAngle:
    case TireOption.SlipRatio:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        ticks: [-1, 0, 1],
        domain: ([dataMin, dataMax]: [number, number]) => { const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1) + 0.2; return [-absMax, absMax]; },
        progress: (value: number) => Math.abs(value),
      };
    case TireOption.CombinedSlip:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        ticks: [0, 1],
        domain: ([, max]) => { return [0, max * 1.05]; },
        progress: (value: number) => value,
      };
    case TireOption.TireWear:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        ticks: [0, 1],
        domain: () => { return [0, 1]; },
        progress: (value: number) => value,
      };
    case TireOption.Temp:
      switch (unitSystem) {
        case UnitSystem.Imperial:
          return {
            formatter: (value: number) => `${value.toFixed(1)} °F`,
            ticks: undefined,
            domain: undefined,
            progress: (value: number) => value / 275,
          };
        default: {
          const toC = (value: number) => (value - 32) * 5 / 9;
          return {
            formatter: (value: number) => `${toC(value).toFixed(1)} °C`,
            ticks: undefined,
            domain: undefined,
            progress: (value: number) => value / 275,
          };
        }
      }
    case TireOption.WheelRotationSpeed:
      return {
        formatter: (value: number) => `${value.toFixed(1)} Radians/Sec`,
        ticks: undefined,
        domain: undefined,
        progress: () => 0,
      };
    case TireOption.SurfaceRumble:
    case TireOption.WheelOnRumbleStrip:
    case TireOption.WheelInPuddleDepth:
    case TireOption.NormalizedSuspensionTravel:
    case TireOption.SuspensionTravelMeters:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        ticks: [0, 0.5, 1],
        domain: [0, 1],
        progress: (value: number) => value,
      };
  }
}
