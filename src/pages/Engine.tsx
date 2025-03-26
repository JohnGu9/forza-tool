import { SharedAxis } from "material-design-transform";
import React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, LinearProgress, Ripple, Typography } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { dummyMessageData, MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getPowerUnit, getTorqueUnit, nmTo, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";

const columnHeight = 150;
const chartsPadding = 32;

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
  return <div className="fill-parent flex-column">
    <div className="flex-row flex-space-between" style={{ height: columnHeight, gap: 8, padding }}>
      <SimpleCard title="RPM" content={lastMessageData.currentEngineRpm.toFixed(0)}
        tooltip="unit: Rev/Min"
        onClick={changeUnitSystem} />
      *
      <SimpleCard title="Torque" content={nmTo(Math.max(lastMessageData.torque, 0), unitSystem).toFixed(1)}
        tooltip={`unit: ${getTorqueUnit(unitSystem)}`}
        onClick={changeUnitSystem} />
      =
      <SimpleCard title="Power" content={wTo(Math.max(lastMessageData.power, 0), unitSystem).toFixed(1)}
        tooltip={`unit: ${powerUnitName}`}
        onClick={() => setShowEnginePowerCurve(!showEnginePowerCurve)} />
    </div>
    <SharedAxis className="flex-child" keyId={showEnginePowerCurve ? 1 : 0} style={{ overflow: "clip" }}>
      {showEnginePowerCurve ?
        <PowerCurveChart messageDataAnalysis={messageDataAnalysis} lastMessageData={lastMessageData} /> :
        <PowerLevelChart messageDataAnalysis={messageDataAnalysis} messageData={messageData} />}
    </SharedAxis>
    <div style={{ height: 16 }} aria-hidden />
    <Ripple onClick={() => setShowEnginePowerCurve(!showEnginePowerCurve)}>
      <SimpleRow title={`Power Level (Max Power ${wTo(messageDataAnalysis.maxPower.value, unitSystem).toFixed(1)} ${powerUnitName} - RPM ${messageDataAnalysis.maxPower.rpm.toFixed(1)})`} value={powerLevel} color={getPowerLevelProgressColor()} />
      <SimpleRow title="Accelerator" value={lastMessageData.accelerator / 255} />
      <div style={{ height: 16 }} aria-hidden />
    </Ripple>
  </div>;
}

function PowerCurveChart({ messageDataAnalysis, lastMessageData }: { messageDataAnalysis: MessageDataAnalysis; lastMessageData: MessageData; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => toData(messageDataAnalysis, unitSystem), [unitSystem, messageDataAnalysis.stamp]);
  const maxPower = wTo(messageDataAnalysis.maxPower.value, unitSystem);
  const currentPower = wTo(Math.max(lastMessageData.power, 0), unitSystem);
  const powerLevel = maxPower === 0 ? 0 : currentPower / maxPower;
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart title="PowerCurve" data={data}
      margin={{ top: 0, right: chartsPadding + 2, left: chartsPadding - 18 }}>
      <XAxis xAxisId={0} dataKey="rpm" type="number" domain={[lastMessageData.engineIdleRpm, lastMessageData.engineMaxRpm]} allowDataOverflow={false}
        ticks={getTicks(lastMessageData.engineMaxRpm, lastMessageData.engineIdleRpm, 1000)} />
      <YAxis yAxisId={1} type="number" domain={([, max]) => { return [0, max * 1.05]; }} hide />
      <YAxis yAxisId={0} type="number" domain={([, max]) => { return [0, max * 1.05]; }}
        ticks={getTicks(maxPower * 1.05, 0, 50)} />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip formatter={(value, name) => {
        switch (name) {
          case "power":
            return `${(value as number).toFixed(1)} (${((value as number) / maxPower * 100).toFixed(1)}%)`;
          default:
            return (value as number).toFixed(1);
        }
      }}
        labelFormatter={label => (label as number).toFixed(1)}
        contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
      <Legend />
      <Area yAxisId={1} type="monotone" dataKey="torque" stroke="var(--md-sys-color-primary)" fillOpacity={0.6} fill="var(--md-sys-color-primary)" isAnimationActive={false} />
      <Area yAxisId={0} type="monotone" dataKey="power" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
      <ReferenceLine stroke="var(--md-sys-color-tertiary)" strokeDasharray="3 3" y={maxPower} label={maxPower.toFixed(1)} ifOverflow="visible" isFront={true} />
      <ReferenceLine stroke="var(--md-sys-color-tertiary)" strokeDasharray="3 3" x={messageDataAnalysis.maxPower.rpm} label={messageDataAnalysis.maxPower.rpm.toFixed(1)} ifOverflow="visible" isFront={true} />
      {/* <ReferenceLine stroke="var(--md-sys-color-tertiary)" x={lastMessageData.currentEngineRpm} ifOverflow="visible" isFront={true} /> */}
      <ReferenceLine stroke="var(--md-sys-color-tertiary)" strokeOpacity={powerLevel} y={currentPower} ifOverflow="visible" isFront={true} />
      <ReferenceDot stroke="none" fill={mergeColor("#82ca9d", "#ffffff", powerLevel)} yAxisId={0} xAxisId={0} r={3} x={lastMessageData.currentEngineRpm} y={currentPower} ifOverflow="visible" isFront={true} />
    </AreaChart>
  </ResponsiveContainer>;
}

// color: string (hex format like #ffffff)
// factor: number (0~1, 0 mean 1000% color0, 1 mean 100% color1)
function mergeColor(color0: string, color1: string, factor: number) {
  function colorToNumbers(color: string) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return { r, g, b };
  }
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
      return "var(--md-sys-color-tertiary)";
    };
    if (value["power level"] >= 90) {
      return "var(--md-sys-color-primary)";
    };
    return "var(--md-sys-color-error)";
  }
  return <ResponsiveContainer width="100%" height="100%">
    <BarChart title="PowerLevel" data={data}
      margin={{ top: 0, right: chartsPadding + 4, left: chartsPadding - 16 }}>
      <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} tick={false} />
      <YAxis yAxisId={1} type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} allowDataOverflow={false} />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip formatter={(value) => { return (value as number).toFixed(1); }}
        contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
      <Legend />
      <Bar yAxisId={1} dataKey="power level" fill="var(--md-sys-color-tertiary)" unit="%" isAnimationActive={false} >
        {data.map((value) =>
          <Cell key={value.index} fill={getColor(value)} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>;
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

function getTicks(max: number, min: number, gap: number) {
  const sections = max / gap;
  const startSections = min / gap;
  const ticks = [];
  for (let i = Math.ceil(startSections); i <= sections; i++) {
    ticks.push(i * gap);
  }
  return ticks;
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
  return <div className="flex-column" style={{ justifyContent: "space-around", padding: "8px 32px" }}>
    <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
      <span>{title}</span>{(value * 100).toFixed(1)}%
    </div>
    <LinearProgress className="disable-progress-transition" value={value} style={{
      "--md-linear-progress-active-indicator-color": color,
    } as React.CSSProperties} />
  </div>;
}
