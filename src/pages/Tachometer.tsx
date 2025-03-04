import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ReactStreamAppContext } from "../common/AppContext";
import React from "react";
import { MessageDataAnalysis } from "../common/MessageData";
import { Card, Ripple, Typography } from "rmcw/dist/components3";

const startAngle = -45;
const endAngle = 225;
const columnHeight = 150;

export default function Tachometer() {
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastData = messageData.getLast() ?? { currentEngineRpm: 0, engineMaxRpm: 6000, power: 0 };
  const { lower, upper } = getRange(messageDataAnalysis);
  const powerLevel = Math.max(lastData.power / messageDataAnalysis.maxPower.value, 0);
  return <div className="fill-parent flex-column" style={{ padding: "16px 32px" }}>
    <div style={{ flex: "1 1", minHeight: 0, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="65%" fill={powerLevel > 0.97 ? "#82ca9d" : "#8884d8"} startAngle={getAngle(powerLevel, endAngle, startAngle)} endAngle={endAngle}
            data={[{ name: "PowerLevel", value: powerLevel }]} />
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="80%" fill="#8884d8" startAngle={startAngle} endAngle={endAngle}
            data={[{ name: "High RPM Range - Low Power", value: lastData.engineMaxRpm - upper }, { name: "RPM Range - High Power", value: upper - lower }, { name: "Low RPM Range - Low Power", value: lower }]}>
            <Cell fill="#8884d8" />
            <Cell fill="#82ca9d" />
            <Cell fill="#8884d8" />
          </Pie>
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="85%" outerRadius="90%" fill="#82ca9d" startAngle={getAngle(lastData.currentEngineRpm / lastData.engineMaxRpm, endAngle, startAngle)} endAngle={endAngle}
            data={[{ name: "CurrentEngineRpm", value: lastData.currentEngineRpm }]} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="flex-row" style={{ height: columnHeight, justifyContent: "space-around", gap: 16, padding: "0 0 16px" }}>
      <SimpleCard title="RPM" content={lastData.currentEngineRpm.toFixed(0)} tooltip={`Rev / Min`} onClick={() => { }} />
      <SimpleCard title="Recommend RPM Range" content={`${lower.toFixed(0)} / ${upper.toFixed(0)}`} tooltip={`Rev / Min`} onClick={() => { }} />
      <SimpleCard title="Power Level" content={`${(powerLevel * 100).toFixed(1)}%`} tooltip={``} onClick={() => { }} />
    </div>
  </div>;
}

function getAngle(current: number/* 0~1 */, start: number, end: number) {
  return start * (1 - current) + end * current;
}

function getRange(messageDataAnalysis: MessageDataAnalysis) {
  const sorted = [...messageDataAnalysis.powerCurve.entries()]
    .map(([key, { rpm, power }]) => { return { x: rpm, y: power, key }; })
    .sort((a, b) => a.x - b.x);
  if (sorted.length === 0) {
    return { lower: 0, upper: 0 };
  }
  const maxKey = messageDataAnalysis.maxPower.rpm.toFixed(1);
  const maxIndex = sorted.findIndex(data => data.key === maxKey)!;
  const threshold97 = messageDataAnalysis.maxPower.value * 0.97;
  const { lower, upper } = getBound(sorted, maxIndex, threshold97);
  return { lower: sorted[lower].x, upper: sorted[upper].x };
}

function getBound(sorted: { x: number, y: number; }[], maxIndex: number, min: number) {
  let upper = sorted.length - 1;
  for (let i = maxIndex + 1; i < sorted.length; i++) {
    const data = sorted[i];
    if (data.y < min) {
      upper = i;
      break;
    }
  }
  let lower = 0;
  for (let i = maxIndex - 1; i >= 0; i--) {
    const data = sorted[i];
    if (data.y < min) {
      lower = i;
      break;
    }
  }
  return { lower, upper };
}

function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: string; onClick: () => unknown; }) {
  return <Card style={{ flex: "1 1", maxWidth: 280, height: "100%", overflow: "clip", textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-evenly" style={{ borderRadius: "var(--_container-shape, 12px)", padding: "0 32px" }}>
      <Typography.Title.Medium tag='span' title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}
