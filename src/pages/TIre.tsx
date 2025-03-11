import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { Card, LinearProgress, Select, SelectOption } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { UnitSystem } from "../common/UnitConvert";

export default function Tire() {
  const [tireOption, setTireOption] = React.useState(Type.SlipAngle);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { frontLeft, frontRight, rearLeft, rearRight } = getTargetData(messageData, tireOption);
  const displayText = React.useMemo(() => capitalizeFirstLetter(tireOption), [tireOption]);
  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding: "16px " }}>
    <Select label="option" displayText={displayText}>
      {Object.values(Type).map(key => <SelectOption key={key} headline={key} selected={tireOption === key} onClick={() => setTireOption(key as Type)} style={{ textTransform: "capitalize" }} />)}
    </Select>
    <div className="flex-child" style={{ display: "grid", gridTemplateColumns: "50% 50%", gridTemplateRows: "50% 50%", gap: "16px", padding: "16px 16px 16px 0" }}>
      <SimpleCard title="FrontLeft" data={frontLeft} type={tireOption} />
      <SimpleCard title="FrontRight" data={frontRight} type={tireOption} />
      <SimpleCard title="RearLeft" data={rearLeft} type={tireOption} />
      <SimpleCard title="RearRight" data={rearRight} type={tireOption} />
    </div>
  </div>;
}

enum Type {
  SlipAngle = "tireSlipAngle",
  SlipRatio = "tireSlipRatio",
  CombinedSlip = "tireCombinedSlip",
  Temp = "tireTemp",
  SurfaceRumble = "surfaceRumble",
  WheelRotationSpeed = "wheelRotationSpeed",
  WheelOnRumbleStrip = "wheelOnRumbleStrip",
  WheelInPuddleDepth = "wheelInPuddleDepth",
  NormalizedSuspensionTravel = "normalizedSuspensionTravel",
  SuspensionTravelMeters = "suspensionTravelMeters",
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, type: Type) {
  const { keyFrontLeft, keyFrontRight, keyRearLeft, keyRearRight } = {
    keyFrontLeft: `${type}FrontLeft`,
    keyFrontRight: `${type}FrontRight`,
    keyRearLeft: `${type}RearLeft`,
    keyRearRight: `${type}RearRight`
  };
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

function SimpleCard({ title, data, type }: { title: string, data: DataType[]; type: Type; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1].value);
  const { formatter, progress, domain, ticks, } = React.useMemo(() => getSettings(type, unitSystem), [type, unitSystem]);
  return <Card className="flex-column flex-space-evenly" style={{ alignItems: "stretch", padding: 16 }}>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 0, left: -32, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} />
          <YAxis domain={domain} ticks={ticks} />
          <Tooltip formatter={(value) => { return formatter(value as number); }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Line type="monotone" dataKey="value" stroke="var(--md-sys-color-tertiary)" dot={false} animationDuration={350} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
      <span>{title}</span>{formatter(value)}
    </div>
    <LinearProgress value={progress(value)} style={{ "--rmcw-linear-progress-transition": "none" } as React.CSSProperties} />
  </Card>;
}

function getSettings(type: Type, unitSystem: UnitSystem): {
  formatter: (value: number) => string;
  ticks: (string | number)[] | undefined;
  domain: AxisDomain | undefined;
  progress: (value: number) => number;
} {
  switch (type) {
    case Type.SlipAngle:
    case Type.SlipRatio:
    case Type.CombinedSlip:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        ticks: [-1, 0, 1],
        domain: ([dataMin, dataMax]: [number, number]) => { const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1) + 0.2; return [-absMax, absMax]; },
        progress: (value: number) => Math.abs(value),
      };
    case Type.Temp:
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
    case Type.WheelRotationSpeed:
      return {
        formatter: (value: number) => `${value.toFixed(1)} Radians/Sec`,
        ticks: undefined,
        domain: undefined,
        progress: () => 0,
      };
    case Type.SurfaceRumble:
    case Type.WheelOnRumbleStrip:
    case Type.WheelInPuddleDepth:
    case Type.NormalizedSuspensionTravel:
    case Type.SuspensionTravelMeters:
      return {
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
        ticks: [0, 0.5, 1],
        domain: [0, 1],
        progress: (value: number) => value,
      };
  }
}
