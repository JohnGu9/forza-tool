import React from "react";
import { Card, LinearProgress, ListItem, Radio, Typography } from "rmcw/dist/components3";
import { MessageData } from "../common/MessageData";
import CircularBuffer from "../common/CircularBuffer";
import useResize, { sizeToKey } from "../hooks/resize";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ReactStreamAppContext } from "../common/AppContext";

export default function Tire() {
  const [type, setType] = React.useState(Type.SlipAngle);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { frontLeft, frontRight, rearLeft, rearRight } = getTargetData(messageData, type);
  return <div className="fill-parent flex-column" style={{ justifyContent: "space-between", padding: "16px 32px" }}>
    <div>
      <Typography.Headline.Small tag='div' style={{ padding: "0 16px" }}>Type</Typography.Headline.Small>
      <ListItem type="button" trailingSupportingText={<Radio checked={type === Type.SlipAngle} />} onClick={() => setType(Type.SlipAngle)}>Slip Angle</ListItem>
      <ListItem type="button" trailingSupportingText={<Radio checked={type === Type.SlipRatio} />} onClick={() => setType(Type.SlipRatio)}>Slip Ratio</ListItem>
      <ListItem type="button" trailingSupportingText={<Radio checked={type === Type.CombinedSlip} />} onClick={() => setType(Type.CombinedSlip)}>Combined Slip</ListItem>
    </div>
    <div style={{ flexGrow: "1", minHeight: 0, display: "grid", gridTemplateColumns: "50% 50%", gridTemplateRows: "50% 50%", gap: "16px", padding: "16px 16px 16px 0" }}>
      <SimpleCard title="FrontLeft" tireInfo={frontLeft} />
      <SimpleCard title="FrontRight" tireInfo={frontRight} />
      <SimpleCard title="RearLeft" tireInfo={rearLeft} />
      <SimpleCard title="RearRight" tireInfo={rearRight} />
    </div>
  </div>;
}

enum Type {
  SlipAngle = "tireSlipAngle",
  SlipRatio = "tireSlipRatio",
  CombinedSlip = "tireCombinedSlip",
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, type: Type) {
  let index = 0;
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
  for (const data of messageData) {
    frontLeft[index] = { index, value: data[keyFrontLeft as "tireSlipAngleFrontLeft"] };
    frontRight[index] = { index, value: data[keyFrontRight as "tireSlipAngleFrontLeft"] };
    rearLeft[index] = { index, value: data[keyRearLeft as "tireSlipAngleFrontLeft"] };
    rearRight[index] = { index, value: data[keyRearRight as "tireSlipAngleFrontLeft"] };
    index++;
  }
  return { frontLeft, frontRight, rearLeft, rearRight };
}

function SimpleCard({ title, tireInfo }: { title: string, tireInfo: DataType[]; }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const value = tireInfo.length === 0 ? 0 : Math.abs(tireInfo[tireInfo.length - 1].value);
  return <Card className="flex-column" style={{ flexGrow: "1", height: "100%", justifyContent: "space-evenly", alignItems: "center", padding: 16 }}>
    <div ref={ref} style={{ flexGrow: "1", width: "100%", overflow: "hidden" }}>
      <LineChart key={sizeToKey(size)} width={size.width} height={size.height} data={tireInfo}
        margin={{ top: 5, right: 0, left: -36, bottom: -10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="index" type="number" tick={false} />
        <YAxis domain={([dataMin, dataMax]) => { const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax)) + 0.2; return [-absMax, absMax]; }}
          ticks={[-1, 0, 1]} />
        <Tooltip formatter={(value) => { return (value as number).toFixed(3); }}
          contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" dot={false} />
      </LineChart>
    </div>
    <div className="flex-row" style={{ width: "100%", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span>{title}</span>{(value * 100).toFixed(1)}%
    </div>
    <LinearProgress value={value} style={{ width: "100%", "--rmcw-linear-progress-transition": "none" } as React.CSSProperties} />
  </Card>;
}
