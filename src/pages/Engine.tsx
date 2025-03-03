import { Area, AreaChart, CartesianGrid, Legend, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";
import { Card, LinearProgress, Ripple, Typography } from "rmcw/dist/components3";
import { dummyMessageData, MessageData, MessageDataAnalysis } from "../common/MessageData";
import CircularBuffer from "../common/CircularBuffer";
import { ReactAppContext, ReactStreamAppContext, UnitSystem } from "../common/AppContext";
import { SharedAxis, SharedAxisTransform } from "material-design-transform";

const columnHeight = 150;
const chartsPadding = 32;

export default function Engine() {
  const { unitSystem, setUnitSystem, showEnginePowerCurve, setShowEnginePowerCurve } = React.useContext(ReactAppContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastMessageData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  const powerLevel = messageDataAnalysis.maxPower.value === 0 ? 0 : Math.max(lastMessageData.power / messageDataAnalysis.maxPower.value, 0);
  const changeUnitSystem = React.useCallback(() => {
    switch (unitSystem) {
      case UnitSystem.International:
        return setUnitSystem(UnitSystem.Imperial);
      case UnitSystem.Imperial:
        return setUnitSystem(UnitSystem.International);
    }
  }, [setUnitSystem, unitSystem]);
  return <div className="fill-parent flex-column">
    <div className="flex-row" style={{ height: columnHeight, justifyContent: "space-between", alignItems: "center", gap: 8, padding: "16px 32px" }}>
      <SimpleCard title="RPM" content={lastMessageData.currentEngineRpm.toFixed(0)}
        tooltip="unit: REV/MIN"
        onClick={changeUnitSystem} />
      *
      <SimpleCard title="Torque" content={nmTo(lastMessageData.torque, unitSystem).toFixed(1)}
        tooltip={`unit: ${getTorqueUnit(unitSystem)}`}
        onClick={changeUnitSystem} />
      =
      <SimpleCard title="Power" content={wsTo(lastMessageData.power, unitSystem).toFixed(1)}
        tooltip={`unit: ${getPowerUnit(unitSystem)}`}
        onClick={() => setShowEnginePowerCurve(!showEnginePowerCurve)} />
    </div>
    <SharedAxis keyId={showEnginePowerCurve ? 1 : 0} style={{ flex: "1 1", minHeight: 0, width: "100%", overflow: "clip" }}
      transform={SharedAxisTransform.fromLeftToRight}
      onPointerEnterCapture={undefined}// ts type file is massing up, ignore the two useless argument
      onPointerLeaveCapture={undefined}>
      {showEnginePowerCurve ?
        <PowerCurveChart messageDataAnalysis={messageDataAnalysis} lastMessageData={lastMessageData} /> :
        <PowerLevelChart messageDataAnalysis={messageDataAnalysis} messageData={messageData} />}
    </SharedAxis>
    <div style={{ height: 16 }} aria-hidden />
    <Ripple onClick={() => setShowEnginePowerCurve(!showEnginePowerCurve)}>
      <SimpleRow title="Power Level" value={powerLevel} />
      <SimpleRow title="Accelerator" value={lastMessageData.accelerator / 255} />
      <div style={{ height: 16 }} aria-hidden />
    </Ripple>
  </div>;
}

function PowerCurveChart({ messageDataAnalysis, lastMessageData }: { messageDataAnalysis: MessageDataAnalysis; lastMessageData: MessageData; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => toData(messageDataAnalysis, unitSystem), [unitSystem, messageDataAnalysis.stamp]);
  const maxPower = wsTo(messageDataAnalysis.maxPower.value, unitSystem);
  const currentPower = wsTo(lastMessageData.power, unitSystem);
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart title="PowerCurve" data={data}
      margin={{ top: 0, right: chartsPadding + 2, left: chartsPadding - 18 }}>
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
      }} contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
      <Legend />
      <Area yAxisId={1} type="monotone" dataKey="torque" stroke="#8884d8" fillOpacity={1} fill="url(#colorTorque)" animationDuration={650} />
      <Area yAxisId={0} type="monotone" dataKey="power" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPower)" animationDuration={650} />
      <ReferenceLine stroke="#82ca9d" strokeDasharray="3 3" y={maxPower} label={maxPower.toFixed(1)} ifOverflow="visible" isFront={true} />
      <ReferenceLine stroke="#82ca9d" strokeDasharray="3 3" x={messageDataAnalysis.maxPower.rpm} label={messageDataAnalysis.maxPower.rpm.toFixed(1)} ifOverflow="visible" isFront={true} />
      {/* <ReferenceLine stroke="#82ca9d" x={lastMessageData.currentEngineRpm} ifOverflow="visible" isFront={true} /> */}
      <ReferenceLine stroke="#82ca9d" strokeOpacity={currentPower / maxPower} y={currentPower} ifOverflow="visible" isFront={true} />
      <ReferenceDot stroke="none" fill={mergeColor("#82ca9d", "#ffffff", currentPower / maxPower)} yAxisId={0} xAxisId={0} r={3} x={lastMessageData.currentEngineRpm} y={currentPower} ifOverflow="visible" isFront={true} />
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
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart title="PowerLevel" data={data}
      margin={{ top: 0, right: chartsPadding + 4, left: chartsPadding - 16 }}>
      <defs>
        <linearGradient id="colorPowerLevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} tick={false} />
      <YAxis yAxisId={1} type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} allowDataOverflow={false} />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip formatter={(value) => { return (value as number).toFixed(1); }}
        contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
      <Legend />
      <Area yAxisId={1} type="monotone" dataKey="power level" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPowerLevel)" unit="%" animationDuration={650} />
    </AreaChart>
  </ResponsiveContainer>;
}

function toData(messageAnalysis: MessageDataAnalysis, unit: UnitSystem) {
  const data: { rpm: number; torque: number; power: number; }[] = [];
  for (const [rpm, { power, torque }] of messageAnalysis.powerCurve.entries()) {
    data.push({ rpm: parseFloat(rpm), power: wsTo(power, unit), torque: nmTo(torque, unit) });
  }
  const res = data.sort((a, b) => a.rpm - b.rpm);

  // only show part of data, reduce render work
  const targetDrawPointAmount = 256;
  const rpmGap = Math.max(20.0/* at least every 20 rpm show 1 data */, messageAnalysis.maxPower.rpm / targetDrawPointAmount);
  const reduceItems = [data[0]];
  const endIndex = res.length - 1;
  for (let i = 1; i < endIndex;) {
    const data = res[i];
    const lastData: { rpm: number; torque: number; power: number; }[] = [];
    let maxPowerIndex: number | undefined = undefined;
    for (; i < endIndex && ((res[i].rpm - data.rpm) < rpmGap || lastData.length < 4); i++) {
      if (Math.abs(messageAnalysis.maxPower.rpm - res[i].rpm) < 0.1) {
        maxPowerIndex = i;
      }
      lastData.push(res[i]);
    }
    function getTarget() {
      if (maxPowerIndex !== undefined) {
        return res[maxPowerIndex];
      }
      const sorted = lastData.sort((a, b) => a.power - b.power);
      return sorted[Math.floor(sorted.length * 3 / 4)];
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
  return <Card style={{ flex: "1 1", maxWidth: 240, height: "100%", overflow: "clip", textWrap: "nowrap" }}>
    <Ripple className="fill-parent flex-column flex-space-evenly" style={{ borderRadius: "var(--_container-shape, 12px)" }}
      onClick={onClick}>
      <Typography.Title.Medium tag='span' title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}

function SimpleRow({ title, value }: { title: string; value: number; }) {
  return <div className="flex-column" style={{ justifyContent: "space-around", padding: "8px 32px" }}>
    <div className="flex-row" style={{ justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span>{title}</span>{(value * 100).toFixed(1)}%
    </div>
    <LinearProgress value={value} style={{ width: "100%", "--rmcw-linear-progress-transition": "none" } as React.CSSProperties} />
  </div>;
}

function wsTo(value: number/* unit: w/h */, unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.International:
      return Math.max(0, value) / 1000;// unit: kw/h
    case UnitSystem.Imperial:
      return Math.max(0, value) / 745.699872;// unit: hp
  }
}

function nmTo(value: number/* unit: N/m */, unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.International:
      return Math.max(0, value);// unit: N/m
    case UnitSystem.Imperial:
      return Math.max(0, value) * 0.73756;// unit: lb/ft
  }
}

function getPowerUnit(unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.International:
      return "KW/H";
    case UnitSystem.Imperial:
      return "HP";
  }
}

function getTorqueUnit(unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.International:
      return "N/M";
    case UnitSystem.Imperial:
      return "LB/FT";
  }
}
