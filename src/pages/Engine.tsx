import { SharedAxis } from "material-design-transform";
import React from "react";
import { Card, LinearProgress, Ripple, Typography } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { dummyMessageData, MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getPowerUnit, getTorqueUnit, nmTo, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";
import useEcharts from "./common/Echarts";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => toData(messageDataAnalysis, unitSystem), [unitSystem, messageDataAnalysis.stamp]);
  const maxPower = wTo(messageDataAnalysis.maxPower.value, unitSystem);

  const lastMessageData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  const currentPower = wTo(Math.max(lastMessageData.power, 0), unitSystem);
  function getPowerLevel(power: number) {
    return maxPower === 0 ? 0 : power / maxPower;
  }
  const sliceLength = Math.round(-messageData.getElementCount() / 4);
  const lastData = messageData.slice(sliceLength);
  const powerDiff = messageDataAnalysis.powerDiff.slice(sliceLength);

  const ref = useEcharts<HTMLDivElement>((element) => {
    const style = getComputedStyle(element);
    return {
      grid: {
        left: 64,
        top: 32,
        right: 52,
        bottom: 32
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        valueFormatter: (value: number) => {
          return value.toFixed(3);
        }
      },
      xAxis: [
        {
          show: true,
          type: "value",
          min: lastMessageData.engineIdleRpm,
          max: lastMessageData.engineMaxRpm,
          axisLabel: {
            formatter: (value: number) => {
              return value.toFixed(0);
            },
          },
        },
      ],
      yAxis: [
        {
          show: true,
          type: "value",
          min: 0,
          max: (value: { max: number; }) => { return value.max * 1.05; },
          axisLabel: {
            formatter: (value: number) => {
              return `${value.toFixed(0)} ${getTorqueUnit(unitSystem)}`;
            },
          },
        },
        {
          show: true,
          type: "value",
          min: 0,
          max: (value: { max: number; }) => { return value.max * 1.05; },
          axisLabel: {
            formatter: (value: number) => {
              return `${value.toFixed(0)} ${getPowerUnit(unitSystem)}`;
            },
          },
        }
      ],
      series: [
        {
          xAxisIndex: 0,
          yAxisIndex: 0,
          name: "Torque",
          data: data.map(v => [v.rpm, v.torque]),
          type: 'line',
          areaStyle: {},
          symbolSize: 0,
          smooth: true
        },
        {
          xAxisIndex: 0,
          yAxisIndex: 1,
          name: "Power",
          data: data.map(v => [v.rpm, v.power]),
          type: 'line',
          areaStyle: {},
          symbolSize: 0,
          smooth: true,
          markPoint: {
            symbol: 'circle',
            data: lastData.map((v, index) => {
              const diff = powerDiff[index];
              const power = wTo(v.power, unitSystem);
              return {
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
                name: "Current",
                yAxis: currentPower,
                label: {
                  formatter: '{b}',
                }
              },
              {
                name: "Max Power",
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
  const data = messageData.map((data, index) => {
    return { index, "power level": Math.max(data.power / messageDataAnalysis.maxPower.value, 0) * 100 };
  });
  function getColor(value: { "power level": number; }) {
    if (value["power level"] >= 97) {
      return "--md-sys-color-tertiary";
    }
    if (value["power level"] >= 90) {
      return "--md-sys-color-primary";
    }
    return "--md-sys-color-error";
  }
  const ref = useEcharts<HTMLDivElement>((element) => {
    const style = getComputedStyle(element);
    return {
      grid: {
        left: 42,
        top: 8,
        right: 0,
        bottom: 8
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        valueFormatter: (value: number) => {
          return `${value.toFixed(3)}%`;
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value: number) => {
            return `${value.toFixed(0)}%`;
          },
        },
      },
      series: [
        {
          data: data.map(v => {
            return {
              value: [v.index, v["power level"]],
              itemStyle: {
                color: style.getPropertyValue(getColor(v))
              },
            };
          }),
          type: 'bar',
        },
      ],
    };
  });
  return <div ref={ref} className="fill-parent" />;
}

function toData(messageAnalysis: MessageDataAnalysis, unit: UnitSystem) {
  const res: { rpm: number; torque: number; power: number; }[] = [];
  for (const { power, torque, rpm } of messageAnalysis.powerCurve) {
    res.push({ rpm: rpm, power: wTo(Math.max(power, 0), unit), torque: nmTo(Math.max(torque, 0), unit) });
  }
  if (res.length === 0) {
    return res;
  }
  // only show part of data, reduce render work
  const targetDrawPointAmount = 256;
  const rpmGap = Math.max(20.0/* at least every 20 rpm show 1 data */, (res[res.length - 1].rpm - res[0].rpm) / targetDrawPointAmount);
  const reduceItems = [res[0]];
  const endIndex = res.length - 1;
  for (let i = 1; i < endIndex;) {
    const data = res[i];
    const lastData: { rpm: number; torque: number; power: number; }[] = [];
    let maxPowerIndex: number | undefined = undefined;
    for (; i < endIndex && (res[i].rpm - data.rpm) < rpmGap; i++) {
      if (Math.abs(messageAnalysis.maxPower.rpm - res[i].rpm) < 0.1) {
        maxPowerIndex = i;
      }
      lastData.push(res[i]);
    }
    function getTarget() {
      if (maxPowerIndex !== undefined) {
        return res[maxPowerIndex];
      }
      return lastData[0];
    }
    const target = getTarget();
    reduceItems.push(target);
  }
  if (endIndex !== 0) {
    reduceItems.push(res[endIndex]);
  }
  return reduceItems;
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
