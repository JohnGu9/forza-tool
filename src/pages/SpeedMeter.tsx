import React from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Ripple, Typography } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData, MessageDataAnalysis } from "../common/MessageData";
import { getSpeedUnit, msTo, UnitSystem } from "../common/UnitConvert";

const columnHeight = 150;

export default function SpeedMeter() {
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const { unitSystem, setUnitSystem } = React.useContext(ReactAppContext);
  const changeUnitSystem = React.useCallback(() => {
    switch (unitSystem) {
      case UnitSystem.Metric:
        return setUnitSystem(UnitSystem.Imperial);
      case UnitSystem.Imperial:
        return setUnitSystem(UnitSystem.Metric);
    }
  }, [setUnitSystem, unitSystem]);
  const data = toData(messageData, messageDataAnalysis, unitSystem);
  const lastData = data.length === 0 ? { index: 0, speed: 0, velocity: 0 } : data[data.length - 1];
  const ratio = lastData.speed === 0 ? 0 : lastData.velocity / lastData.speed;
  return <div className="fill-parent flex-column" style={{ padding: "16px" }}>
    <div className="flex-row flex-space-between" style={{ height: columnHeight, alignItems: "stretch", gap: 16, padding: "0 0 16px" }}>
      <SimpleCard title="Speed" content={lastData.speed.toFixed(1)} tooltip={`car speed meter value; unit: ${getSpeedUnit(unitSystem)}`} onClick={changeUnitSystem} />
      <SimpleCard title="Velocity" content={lastData.velocity.toFixed(1)} tooltip={`velocity = (position delta) / (time delta); unit: ${getSpeedUnit(unitSystem)}`} onClick={changeUnitSystem} />
      <SimpleCard title="Ratio" content={`${(ratio * 100).toFixed(1)} %`} tooltip="velocity / speed" onClick={changeUnitSystem} />
    </div>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}
          margin={{ top: 4, right: 2, left: 0, bottom: 8 }}>
          <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} hide />
          <YAxis tickFormatter={value => value.toFixed(1)} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => { return (value as number).toFixed(3); }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Legend />
          <Area type="monotone" dataKey="speed" stroke="var(--md-sys-color-primary)" fillOpacity={0.6} fill="var(--md-sys-color-primary)" isAnimationActive={false} />
          <Area type="monotone" dataKey="velocity" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>;
}

function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: string; onClick: () => unknown; }) {
  return <Card className="flex-child" style={{ maxWidth: 240, textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-evenly fit-elevated-card-container-shape">
      <Typography.Title.Medium tag='span' title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}

function toData(messageData: CircularBuffer<MessageData>, messageDataAnalysis: MessageDataAnalysis, unit: UnitSystem) {
  const delta = messageData.getElementCount() - messageDataAnalysis.speed.getElementCount();
  const placeholder = new Array(delta);
  placeholder.fill(0);
  const velocity = [...placeholder, ...messageDataAnalysis.speed];
  return messageData.map((data, index) => {
    return { index, speed: msTo(data.speed, unit), velocity: msTo(velocity[index], unit) };
  });
}
