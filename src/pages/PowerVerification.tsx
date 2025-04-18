import React from "react";
import { Card } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getPowerUnit, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

export default function PowerVerification() {
  const { padding } = React.useContext(ReactWindowContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const { unitSystem } = React.useContext(ReactAppContext);
  const data = getTargetData(messageData, messageDataAnalysis, unitSystem);

  const ref = useEcharts<HTMLDivElement>((style) => {
    return {
      grid: {
        left: 64,
        top: 24,
        right: 24,
        bottom: 24
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        formatter: (params: unknown) => {
          if (Array.isArray(params)) {
            return (params as { seriesName: string, marker: string; value: [number, number]; }[]).map(v => {
              switch (v.seriesName) {
                case "Power": {
                  const targetData = data[Math.round(v.value[0])];
                  return `${v.marker} ${v.seriesName}: ${(v.value[1]).toFixed(3)} ${getPowerUnit(unitSystem)} (${(targetData.diff * 100).toFixed(3)}% | ${(targetData.Power + targetData["Torque * RPM"]).toFixed(3)} ${getPowerUnit(unitSystem)})`;
                }
                default:
                  return `${v.marker} ${v.seriesName}: ${(-v.value[1]).toFixed(3)} ${getPowerUnit(unitSystem)}`;
              }
            }).join("<br/>");
          }
          return 'Unknown';
        }
      },
      series: [
        {
          name: "Power",
          data: data.map(v => {
            return {
              value: [v.index, v.Power],
              itemStyle: { color: style.getPropertyValue((v.diff > 0.998 && v.diff < 1.002) ? "--md-sys-color-tertiary" : "--md-sys-color-error") },
            };
          }),
          type: 'bar',
          large: true,
        },
        {
          name: "Torque * RPM",
          data: data.map(v => {
            return {
              value: [v.index, v["Torque * RPM"]],
              itemStyle: { color: style.getPropertyValue((v.diff > 0.998 && v.diff < 1.002) ? "--md-sys-color-primary" : "--md-sys-color-error") },
            };
          }),
          type: 'bar',
          large: true,
        },
      ],
    };
  });

  const ref0 = useEcharts<HTMLDivElement>((style) => {
    return {
      grid: {
        left: 64,
        top: 24,
        right: 24,
        bottom: 24
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        valueFormatter: (value) => {
          return `${(value as number * 100).toFixed(3)}%`;
        },
      },
      yAxis: {
        type: 'value',
        min: (value) => { return value.min - 0.001; },
        max: (value) => { return value.max + 0.001; },
        axisLabel: {
          formatter: (value) => {
            return `${(value as number * 100).toFixed(1)}%`;
          },
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          name: "Power Diff",
          data: data.map(v => {
            return {
              value: [v.index, v.diff],
              itemStyle: { color: style.getPropertyValue((v.diff > 0.998 && v.diff < 1.002) ? "--md-sys-color-tertiary" : "--md-sys-color-error") },
            };
          }),
          type: 'bar',
          large: true,
        },
      ],
    };
  });

  return <div className="fill-parent flex-column" style={{ padding, gap: 16 }}>
    <Card className="flex-child" style={{ flex: "3 3" }}>
      <div ref={ref} className="fill-parent" />
    </Card>
    <Card className="flex-child">
      <div ref={ref0} className="fill-parent" />
    </Card>
  </div>;
}

function getTargetData(messageData: CircularBuffer<MessageData>, messageDataAnalysis: MessageDataAnalysis, unitSystem: UnitSystem) {
  const diff = [...messageDataAnalysis.powerDiff];
  const data = messageData.map((data, index) => {
    return {
      index,
      ["Power"]: wTo(data.power, unitSystem),
      ["Torque * RPM"]: - wTo(1000 * data.torque * data.currentEngineRpm / 9550, unitSystem),
      diff: diff[index],
    };
  });
  return data;
}

