import { SharedAxis } from "material-design-transform";
import React from "react";
import { Card, LinearProgress, Ripple, Typography } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { dummyMessageData, MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getPowerUnit, getTorqueUnit, nmTo, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

const columnHeight = 150;

export default function Engine() {
  const { unitSystem, setUnitSystem } = React.useContext(ReactAppContext);
  const { padding, showEnginePowerCurve, setShowEnginePowerCurve } = React.useContext(ReactWindowContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastMessageData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  const powerLevel = messageDataAnalysis.maxPower.value === 0 ? 0 : Math.max(lastMessageData.power / messageDataAnalysis.maxPower.value, 0);
  const changeUnitSystem = React.useCallback(() => {
    switch (unitSystem) {
      case UnitSystem.Metric:
        return setUnitSystem(UnitSystem.Imperial);
      case UnitSystem.Imperial:
        return setUnitSystem(UnitSystem.Metric);
    }
  }, [setUnitSystem, unitSystem]);
  function getPowerLevelProgressColor() {
    if (powerLevel > 0.97) {
      return "var(--md-sys-color-tertiary)";
    }
    if (powerLevel < 0.9) {
      return "var(--md-sys-color-error)";
    }
    return undefined;
  }
  const powerUnitName = getPowerUnit(unitSystem);
  return <div className="fill-parent flex-column" style={{ padding, alignItems: "stretch" }}>
    <div className="flex-row flex-space-between" style={{ height: columnHeight, gap: 8, padding: "0 0 16px" }}>
      <SimpleCard title="RPM"
        content={lastMessageData.currentEngineRpm.toFixed(0)}
        tooltip="unit: Rev/Min"
        onClick={changeUnitSystem} />
      *
      <SimpleCard title={`Torque (${getTorqueUnit(unitSystem)})`}
        content={nmTo(Math.max(lastMessageData.torque, 0), unitSystem).toFixed(1)}
        tooltip={`unit: ${getTorqueUnit(unitSystem)}`}
        onClick={changeUnitSystem} />
      =
      <SimpleCard title={`Power (${powerUnitName})`} content={wTo(Math.max(lastMessageData.power, 0), unitSystem).toFixed(1)}
        tooltip={`unit: ${powerUnitName}`}
        onClick={() => setShowEnginePowerCurve(!showEnginePowerCurve)} />
    </div>
    <SharedAxis className="flex-child" keyId={showEnginePowerCurve ? 1 : 0}>
      {showEnginePowerCurve ?
        <PowerCurveChart messageDataAnalysis={messageDataAnalysis} messageData={messageData} /> :
        <PowerLevelChart messageDataAnalysis={messageDataAnalysis} messageData={messageData} />}
    </SharedAxis>
    <div style={{ height: 16 }} aria-hidden />
    <Card>
      <Ripple className="fit-elevated-card-container-shape" onClick={() => setShowEnginePowerCurve(!showEnginePowerCurve)}>
        <SimpleRow title={`Power Level (as Max ${wTo(messageDataAnalysis.maxPower.value, unitSystem).toFixed(1)} ${powerUnitName} - ${messageDataAnalysis.maxPower.rpm.toFixed(1)} RPM)`} value={powerLevel} color={getPowerLevelProgressColor()} />
        <SimpleRow title="Accelerator" value={lastMessageData.accelerator / 255} />
        <div style={{ height: 12 }} aria-hidden />
      </Ripple>
    </Card>
  </div>;
}

function PowerCurveChart({ messageDataAnalysis, messageData }: { messageDataAnalysis: MessageDataAnalysis; messageData: CircularBuffer<MessageData>; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const maxPower = wTo(messageDataAnalysis.maxPower.value, unitSystem);

  const lastMessageData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  const currentPower = wTo(Math.max(lastMessageData.power, 0), unitSystem);
  function getPowerLevel(power: number) {
    return maxPower === 0 ? 0 : power / maxPower;
  }
  const sliceLength = Math.round(-messageData.getElementCount() / 4);
  const lastData = messageData.slice(sliceLength);
  const powerDiff = messageDataAnalysis.powerDiff.slice(sliceLength);

  const ref = useEcharts<HTMLDivElement>((style) => {
    return {
      grid: {
        left: 60,
        top: 24,
        right: 52,
        bottom: 24
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        valueFormatter: (value) => {
          return (value as number).toFixed(3);
        }
      },
      xAxis: [
        {
          show: true,
          type: "value",
          min: lastMessageData.engineIdleRpm,
          max: lastMessageData.engineMaxRpm,
          axisLabel: {
            formatter: (value) => {
              return (value as number).toFixed(0);
            },
          },
        },
      ],
      yAxis: [
        {
          show: true,
          type: "value",
          min: 0,
          max: (value) => { return value.max * 1.05; },
          axisLabel: {
            formatter: (value) => {
              const result = `${(value as number).toFixed(0)} ${getTorqueUnit(unitSystem)}`;
              if (result.length > 8) {
                return `${result.slice(0, 6)} ...`;
              }
              return result;
            },
          },
          splitLine: {
            show: false,
          },
        },
        {
          show: true,
          type: "value",
          min: 0,
          max: (value) => { return value.max * 1.05; },
          axisLabel: {
            formatter: (value) => {
              return `${(value as number).toFixed(0)} ${getPowerUnit(unitSystem)}`;
            },
          },
        }
      ],
      series: [
        {
          xAxisIndex: 0,
          yAxisIndex: 0,
          name: "Torque",
          data: messageDataAnalysis.powerCurve.map(v => [v.rpm, nmTo(v.torque, unitSystem)]),
          type: 'line',
          areaStyle: {
            opacity: 0.6,
          },
          symbolSize: 0,
          smooth: true,
          large: true,
        },
        {
          xAxisIndex: 0,
          yAxisIndex: 1,
          name: "Power",
          data: messageDataAnalysis.powerCurve.map(v => [v.rpm, wTo(v.power, unitSystem)]),
          type: 'line',
          areaStyle: {
            opacity: 0.6,
          },
          symbolSize: 0,
          smooth: true,
          large: true,
          markPoint: {
            symbol: 'circle',
            data: lastData.map((v, index) => {
              const diff = powerDiff[index];
              const power = wTo(Math.max(v.power, 0), unitSystem);
              return {
                name: "",
                coord: [v.currentEngineRpm, power],
                symbolSize: Math.pow((index + 1) / lastData.length, 3) * 8,
                itemStyle: {
                  color: diff > 0.998 && diff < 1.002 ?
                    mergeColor(style.getPropertyValue('--md-sys-color-tertiary'), "#ffffff", getPowerLevel(power)) :
                    style.getPropertyValue('--md-sys-color-error')
                },
              };
            })
          },
          markLine: {
            data: [
              {
                name: ` ${currentPower.toFixed(0)} ${getPowerUnit(unitSystem)}`,
                yAxis: currentPower,
                label: {
                  formatter: '{b}',
                }
              },
              {
                name: "Max Power RPM",
                xAxis: messageDataAnalysis.maxPower.rpm,
                label: {
                  formatter: '{b}',
                }
              }
            ]
          },
        },
      ],
    };
  });
  return <div ref={ref} className="fill-parent" />;
}

function colorToNumbers(color: string) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return { r, g, b };
}

// color: string (hex format like #ffffff)
// factor: number (0~1, 0 mean 1000% color0, 1 mean 100% color1)
function mergeColor(color0: string, color1: string, factor: number) {

  const color0Value = colorToNumbers(color0);
  const color1Value = colorToNumbers(color1);
  const r = Math.round(color0Value.r * (1 - factor) + color1Value.r * factor);
  const g = Math.round(color0Value.g * (1 - factor) + color1Value.g * factor);
  const b = Math.round(color0Value.b * (1 - factor) + color1Value.b * factor);
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

function PowerLevelChart({ messageDataAnalysis, messageData }: { messageDataAnalysis: MessageDataAnalysis; messageData: CircularBuffer<MessageData>; }) {
  function getColor(powerLevel: number) {
    if (powerLevel >= 97) {
      return "--md-sys-color-tertiary";
    }
    if (powerLevel >= 90) {
      return "--md-sys-color-primary";
    }
    return "--md-sys-color-error";
  }
  const ref = useEcharts<HTMLDivElement>((style) => {
    return {
      grid: {
        left: 42,
        top: 8,
        right: 32,
        bottom: 8
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        valueFormatter: (value) => {
          return `${(value as number).toFixed(3)}%`;
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value) => {
            return `${(value as number).toFixed(0)}%`;
          },
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          data: messageData.map((data, index) => {
            const powerLevel = Math.max(data.power / messageDataAnalysis.maxPower.value, 0) * 100;
            return {
              value: [index, powerLevel],
              itemStyle: {
                color: style.getPropertyValue(getColor(powerLevel))
              },
            };
          }),
          type: 'bar',
          large: true,
          markLine: {
            data: [
              {
                name: "97%",
                yAxis: 97,
                label: {
                  formatter: '{b}',
                },
                lineStyle: {
                  color: style.getPropertyValue("--md-sys-color-tertiary")
                },
              },
              {
                name: "90%",
                yAxis: 90,
                label: {
                  formatter: '{b}',
                }
              }
            ]
          },
        },
      ],
    };
  });
  return <div ref={ref} className="fill-parent" />;
}

function SimpleCard({ title, content, tooltip, onClick }: { title: string, content: string; tooltip: string; onClick: () => unknown; }) {
  return <Card className="flex-child" style={{ maxWidth: 240, height: "100%", textWrap: "nowrap" }}>
    <Ripple className="fill-parent flex-column flex-space-evenly fit-elevated-card-container-shape"
      onClick={onClick}>
      <Typography.Title.Medium tag='span' title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}

function SimpleRow({ title, value, color }: { title: string; value: number; color?: string; }) {
  return <div className="flex-column" style={{ justifyContent: "space-around", padding: "4px 16px" }}>
    <div className="flex-row flex-space-between" style={{ padding: "8px 0" }}>
      <span>{title}</span>{(value * 100).toFixed(1)}%
    </div>
    <LinearProgress className="only-color-transition" value={value} style={{
      "--md-linear-progress-active-indicator-color": color,
    } as React.CSSProperties} />
  </div>;
}
