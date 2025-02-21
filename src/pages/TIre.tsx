import React from "react";
import { Card, LinearProgress, ListItem, Radio, Typography } from "rmcw/dist/components3";
import { MessageData } from "../common/MessageData";
import CircularBuffer from "../common/CircularBuffer";
import useResize from "../hooks/resize";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ReactStreamAppContext } from "../common/AppContext";

export default function Tire() {
  const [type, setType] = React.useState(Type.SlipAngle);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const tireInfo = toTireInfo(messageData, type);
  return <div className="fill-parent flex-column" style={{ justifyContent: "space-between", padding: "16px 32px" }}>
    <div>
      <Typography.Headline.Small tag='div' style={{ padding: "0 16px" }}>Type</Typography.Headline.Small>
      <ListItem type="button" trailingSupportingText={<Radio checked={type === Type.SlipAngle} />} onClick={() => setType(Type.SlipAngle)}>Slip Angle</ListItem>
      <ListItem type="button" trailingSupportingText={<Radio checked={type === Type.SlipRatio} />} onClick={() => setType(Type.SlipRatio)}>Slip Ratio</ListItem>
      <ListItem type="button" trailingSupportingText={<Radio checked={type === Type.CombinedSlip} />} onClick={() => setType(Type.CombinedSlip)}>Combined Slip</ListItem>
    </div>
    <div className="flex-row" style={{ flexGrow: "1" }}>
      <SimpleCard title="FrontLeft" tireInfo={tireInfo} tirePosition={0} />
      <div style={{ width: 16 }} aria-hidden />
      <SimpleCard title="FrontRight" tireInfo={tireInfo} tirePosition={1} />
    </div>
    <div style={{ height: 16 }} aria-hidden />
    <div className="flex-row" style={{ flexGrow: "1" }}>
      <SimpleCard title="RearLeft" tireInfo={tireInfo} tirePosition={2} />
      <div style={{ width: 16 }} aria-hidden />
      <SimpleCard title="RearRight" tireInfo={tireInfo} tirePosition={3} />
    </div>
  </div>;
}

enum Type {
  SlipAngle = "tireSlipAngle",
  SlipRatio = "tireSlipRatio",
  CombinedSlip = "tireCombinedSlip",
}

type TireInfo = [number, number, number, number];

function toTireInfo(messageData: CircularBuffer<MessageData>, type: Type) {
  const { keyFrontLeft, keyFrontRight, keyRearLeft, keyRearRight } = {
    keyFrontLeft: `${type}FrontLeft`,
    keyFrontRight: `${type}FrontRight`,
    keyRearLeft: `${type}RearLeft`,
    keyRearRight: `${type}RearRight`
  };
  return messageData.map(data => [
    data[keyFrontLeft as "tireSlipAngleFrontLeft"],
    data[keyFrontRight as "tireSlipAngleFrontRight"],
    data[keyRearLeft as "tireSlipAngleRearLeft"],
    data[keyRearRight as "tireSlipAngleRearRight"]] as TireInfo);
}

function SimpleCard({ title, tireInfo, tirePosition }: { title: string, tireInfo: TireInfo[]; tirePosition: 0 | 1 | 2 | 3; }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const value = tireInfo.length === 0 ? 0 : Math.abs(tireInfo[tireInfo.length - 1][tirePosition]);
  const data = React.useMemo(() => {
    return tireInfo.map((value, index) => { return { index, value: value[tirePosition] }; });
  }, [tireInfo, tirePosition]);
  return <Card className="flex-column" style={{ flexGrow: "1", height: "100%", justifyContent: "space-evenly", alignItems: "center", padding: 16 }}>
    <div ref={ref} style={{ flexGrow: "1", width: "100%" }}>
      <LineChart width={size.width} height={size.height} data={data}
        margin={{ top: 5, right: 0, left: -30, bottom: -10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="index" type="number" tick={false} />
        <YAxis domain={([dataMin, dataMax]) => { const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax)) + 0.2; return [-absMax, absMax]; }}
          ticks={[-1, 0, 1]} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
    </div>
    <div className="flex-row" style={{ width: "100%", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span>{title}</span>{(value * 100).toFixed(0)}%
    </div>
    <LinearProgress value={value} style={{ width: "100%" }} />
  </Card>;
}
