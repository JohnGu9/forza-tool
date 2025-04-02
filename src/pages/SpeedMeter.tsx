import React from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Ripple, Typography } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getSpeedUnit, msTo, UnitSystem } from "../common/UnitConvert";
import { ReactWindowContext, SpeedMeterOption } from "./common/Context";

const columnHeight = 150;

export default function SpeedMeter() {
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const { unitSystem } = React.useContext(ReactAppContext);
  const { padding, speedMeterOption, setSpeedMeterOption } = React.useContext(ReactWindowContext);
  const onClick = React.useCallback(() => {
    switch (speedMeterOption) {
      case SpeedMeterOption.VelocityVsSpeed:
        return setSpeedMeterOption(SpeedMeterOption.VelocityVsVelocityPrediction);
      case SpeedMeterOption.VelocityVsVelocityPrediction:
        return setSpeedMeterOption(SpeedMeterOption.VelocityPredictionVsSpeed);
      case SpeedMeterOption.VelocityPredictionVsSpeed:
        return setSpeedMeterOption(SpeedMeterOption.VelocityVsSpeed);
    }
  }, [setSpeedMeterOption, speedMeterOption]);
  const data = toData(messageData, messageDataAnalysis, unitSystem);
  const lastData = data.length === 0 ? { index: 0, speed: 0, velocity: 0, velocityPrediction: 0 } : data[data.length - 1];

  function getCompareTarget() {
    function getVelocity() {
      return {
        value: lastData.velocity,
        title: "Velocity",
        tooltip: `Velocity = (Position delta) / (Time delta); unit: ${getSpeedUnit(unitSystem)}`,
        dataKey: "velocity",
      };
    }
    function getVelocityPrediction() {
      return {
        value: lastData.velocityPrediction,
        title: "VelocityPrediction",
        tooltip: "Inferring from previous data",
        dataKey: "velocityPrediction",
      };
    }
    function getSpeed() {
      return {
        value: lastData.speed,
        title: "Speed",
        tooltip: `Car speed meter value; unit: ${getSpeedUnit(unitSystem)}`,
        dataKey: "speed",
      };
    }
    switch (speedMeterOption) {
      case SpeedMeterOption.VelocityVsVelocityPrediction:
        return {
          first: getVelocity(),
          second: getVelocityPrediction(),
        };

      case SpeedMeterOption.VelocityPredictionVsSpeed:
        return {
          first: getVelocityPrediction(),
          second: getSpeed(),
        };
    }
    return {
      first: getVelocity(),
      second: getSpeed(),
    };
  }

  const compareTarget = getCompareTarget();
  const ratio = compareTarget.second.value === 0 ? 0 : compareTarget.first.value / compareTarget.second.value;

  return <div className="fill-parent flex-column" style={{ padding }}>
    <div className="flex-row flex-space-between" style={{ height: columnHeight, alignItems: "stretch", gap: 16, padding: "0 0 16px" }}>
      <SimpleCard title={compareTarget.first.title} content={compareTarget.first.value.toFixed(1)} tooltip={compareTarget.first.tooltip} onClick={onClick} />
      <SimpleCard title={compareTarget.second.title} content={compareTarget.second.value.toFixed(1)} tooltip={compareTarget.second.tooltip} onClick={onClick} />
      <SimpleCard title="Ratio" content={`${(ratio * 100).toFixed(1)} %`} tooltip={`${compareTarget.first.title} / ${compareTarget.second.title}`} onClick={onClick} />
    </div>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%" minHeight="0" minWidth="0">
        <AreaChart data={data}
          margin={{ top: 4, right: 2, left: 0, bottom: 8 }}>
          <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} hide />
          <YAxis tickFormatter={value => value.toFixed(1)} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => `${(value as number).toFixed(1)} ${getSpeedUnit(unitSystem)}`}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Legend />
          <Area type="monotone" dataKey={compareTarget.second.dataKey} stroke="var(--md-sys-color-primary)" fillOpacity={0.2} fill="var(--md-sys-color-primary)" isAnimationActive={false} />
          <Area type="monotone" dataKey={compareTarget.first.dataKey} stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
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
  const velocity = [...messageDataAnalysis.velocity];
  const velocityPrediction = [...messageDataAnalysis.velocityPrediction];
  return messageData.map((data, index) => {
    return {
      index,
      speed: msTo(data.speed, unit),
      velocity: msTo(velocity[index], unit),
      velocityPrediction: msTo(velocityPrediction[index], unit)
    };
  });
}
