import React from "react";
import { Card, Ripple, Typography } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getSpeedUnit, msTo, UnitSystem } from "../common/UnitConvert";
import { ReactWindowContext, SpeedMeterOption } from "./common/Context";
import { useEcharts } from "./common/Echarts";

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

  const ref = useEcharts<HTMLDivElement>({
    grid: {
      left: 32,
      top: 32,
      right: 0,
      bottom: 8
    },
    legend: {},
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => {
        return `${(value as number).toFixed(6)} ${getSpeedUnit(unitSystem)}`;
      }
    },
    yAxis: {
      type: "value",
      min: 0,
      max: (value) => { return value.max * 1.05; },
      axisLabel: {
        formatter: (value) => {
          return value.toFixed(0);
        },
      },
    },
    series: [
      {
        type: "line",
        name: compareTarget.first.title,
        data: data.map(v => [v.index, v[compareTarget.first.dataKey as "speed"]]),
        areaStyle: {
          opacity: 0.6,
        },
        symbolSize: 0,
      },
      {
        type: "line",
        name: compareTarget.second.title,
        data: data.map(v => [v.index, v[compareTarget.second.dataKey as "speed"]]),
        areaStyle: {
          opacity: 0.6,
        },
        symbolSize: 0,
      },
    ]
  });
  return <div className="fill-parent flex-column" style={{ padding }}>
    <div className="flex-row flex-space-between" style={{ height: columnHeight, alignItems: "stretch", gap: 16, padding: "0 0 16px" }}>
      <SimpleCard title={compareTarget.first.title} content={compareTarget.first.value.toFixed(1)} tooltip={compareTarget.first.tooltip} onClick={onClick} />
      <SimpleCard title={compareTarget.second.title} content={compareTarget.second.value.toFixed(1)} tooltip={compareTarget.second.tooltip} onClick={onClick} />
      <SimpleCard title="Ratio" content={`${(ratio * 100).toFixed(1)} %`} tooltip={`${compareTarget.first.title} / ${compareTarget.second.title}`} onClick={onClick} />
    </div>
    <div ref={ref} className="flex-child" style={{ overflow: "clip" }}>
    </div>
  </div>;
}

function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: string; onClick: () => unknown; }) {
  return <Card className="flex-child" style={{ maxWidth: 240, textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-evenly fit-elevated-card-container-shape">
      <Typography.Title.Medium tag="span" title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag="span" title={tooltip}>{content}</Typography.Headline.Large>
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
