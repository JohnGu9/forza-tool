import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import useResize from "../hooks/resize";
import React from "react";
import { Card, CircularProgress, LinearProgress, Ripple, Typography } from "rmcw/dist/components3";
import { dummyMessageData, MessageData, MessageDataAnalysis } from "../common/MessageData";
import CircularBuffer from "../common/CircularBuffer";
import { ReactStreamAppContext } from "../common/AppContext";

const columnHeight = 150;
const chartsPadding = 32;

export default function Engine() {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastMessageData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  const powerLevel = messageDataAnalysis.maxPower === 0 ? 0 : lastMessageData.power / messageDataAnalysis.maxPower;
  const [showPowerCurve, setShowPowerCurve] = React.useState(true);
  return <div className="fill-parent flex-column">
    <div className="flex-row" style={{ height: columnHeight, justifyContent: "space-between", alignItems: "center", padding: "16px 32px" }}>
      <SimpleCard title="RPM" content={`${lastMessageData.currentEngineRpm}`} />
      *
      <SimpleCard title="Torque" content={`${lastMessageData.torque}`} />
      =
      <SimpleCard title="Power" content={`${lastMessageData.power}`} />
      <Card style={{ width: 150, height: 120 }}>
        <Ripple className="fill-parent flex-column" style={{ justifyContent: "space-evenly", alignItems: "center", borderRadius: "var(--_container-shape, 12px)" }}
          onClick={() => setShowPowerCurve(!showPowerCurve)}>
          <Typography.Headline.Small tag='span' title="Current Power / Max Power">{`${(powerLevel * 100).toFixed(0)}%`}</Typography.Headline.Small>
          <CircularProgress value={powerLevel} />
        </Ripple>
      </Card>
    </div>
    <div ref={ref} style={{ flexGrow: "1", width: "100%" }}>
      {showPowerCurve ?
        <PowerCurveChart size={size} messageDataAnalysis={messageDataAnalysis} lastMessageData={lastMessageData} /> :
        <PowerLevelChart size={size} messageDataAnalysis={messageDataAnalysis} messageData={messageData} />}
    </div>
    <SimpleRow title="Clutch" value={lastMessageData.clutch} />
    <SimpleRow title="Accelerator" value={lastMessageData.accelerator} />
    <SimpleRow title="Brake" value={lastMessageData.brake} />
    <SimpleRow title="Handbrake" value={lastMessageData.handbrake} />
    <div style={{ height: 8 }} />
  </div>;
}

function PowerCurveChart({ size, messageDataAnalysis, lastMessageData }: { size: { height: number; width: number; }; messageDataAnalysis: MessageDataAnalysis; lastMessageData: MessageData; }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => toData(messageDataAnalysis), [messageDataAnalysis, messageDataAnalysis.stamp]);

  return <AreaChart width={size.width} height={size.height} data={data}
    margin={{ top: 0, right: chartsPadding + 4, left: chartsPadding - 16 }}>
    <defs>
      <linearGradient id="colorTorque" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="rpm" type="number" domain={['dataMin', 'dataMax']}
      ticks={getTicks(lastMessageData.engineMaxRpm, lastMessageData.engineIdleRpm, 1000)} />
    <YAxis yAxisId={0} type="number" domain={[0, 'dataMax + 20']} hide />
    <YAxis yAxisId={1} type="number" domain={[0, 'dataMax + 20']}
      ticks={getTicks(messageDataAnalysis.maxPower, 0, 50)} />
    <CartesianGrid strokeDasharray="3 3" horizontalCoordinatesGenerator={() => []} />
    <Tooltip />
    <Legend />
    <Area yAxisId={0} type="monotone" dataKey="torque" stroke="#8884d8" fillOpacity={1} fill="url(#colorTorque)" />
    <Area yAxisId={1} type="monotone" dataKey="power" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPower)" />
  </AreaChart>;
}

function PowerLevelChart({ size, messageDataAnalysis, messageData }: { size: { height: number; width: number; }; messageDataAnalysis: MessageDataAnalysis; messageData: CircularBuffer<MessageData>; }) {
  const data = messageData.map((data, index) => {
    return { index, powerLevel: data.power / messageDataAnalysis.maxPower * 100 };
  });
  return <AreaChart width={size.width} height={size.height} data={data}
    margin={{ top: 0, right: chartsPadding + 4, left: chartsPadding - 16 }}>
    <defs>
      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} tick={false} />
    <YAxis yAxisId={1} type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
    <CartesianGrid strokeDasharray="3 3" horizontalCoordinatesGenerator={() => []} />
    <Tooltip />
    <Legend />
    <Area yAxisId={1} type="monotone" dataKey="powerLevel" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPower)" unit="%" />
  </AreaChart>;
}

function toData(messageAnalysis: MessageDataAnalysis) {
  const data: { rpm: number; torque: number; power: number; }[] = [];
  for (const [rpm, { power, torque }] of messageAnalysis.powerCurve.entries()) {
    data.push({ rpm, power, torque });
  }
  return data;
}

function getTicks(max: number, min: number, gap: number) {
  const sections = max / gap;
  const startSections = min / gap;
  const ticks = [];
  for (let i = Math.ceil(startSections); i <= sections; i++) {
    ticks.push(i * gap);
  }
  return ticks;
}

function SimpleCard({ title, content }: { title: string, content: string; }) {
  return <Card className="flex-column" style={{ width: 150, height: "100%", justifyContent: "space-evenly", alignItems: "center" }}>
    <Typography.Headline.Small tag='div'>{title}</Typography.Headline.Small>
    <Typography.Headline.Large tag='div'>{content}</Typography.Headline.Large>
  </Card>;
}

function SimpleRow({ title, value }: { title: string; value: number; }) {
  return <div className="flex-column" style={{ justifyContent: "space-around", padding: "8px 32px" }}>
    <div className="flex-row" style={{ justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span>{title}</span>{(value * 100).toFixed(0)}%
    </div>
    <LinearProgress value={value} style={{ width: "100%" }} />
  </div>;
}
