import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import useResize, { sizeToKey } from "../hooks/resize";
import React from "react";
import { Card, LinearProgress, Ripple, Typography } from "rmcw/dist/components3";
import { dummyMessageData, MessageData, MessageDataAnalysis } from "../common/MessageData";
import CircularBuffer from "../common/CircularBuffer";
import { ReactAppContext, ReactStreamAppContext, UnitSystem } from "../common/AppContext";

const columnHeight = 150;
const chartsPadding = 32;

export default function Engine() {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const { unitSystem, setUnitSystem } = React.useContext(ReactAppContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastMessageData = messageData.isEmpty() ? dummyMessageData : messageData.getLastUnsafe();
  const powerLevel = messageDataAnalysis.maxPower === 0 ? 0 : Math.max(lastMessageData.power / messageDataAnalysis.maxPower, 0);
  const [showPowerCurve, setShowPowerCurve] = React.useState(true);
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
        onClick={() => setShowPowerCurve(value => !value)} />
    </div>
    <div ref={ref} style={{ flexGrow: "1", width: "100%", overflow: "hidden" }}>
      {showPowerCurve ?
        <PowerCurveChart size={size} messageDataAnalysis={messageDataAnalysis} lastMessageData={lastMessageData} /> :
        <PowerLevelChart size={size} messageDataAnalysis={messageDataAnalysis} messageData={messageData} />}
    </div>
    <div style={{ height: 16 }} />
    <Ripple onClick={() => setShowPowerCurve(value => !value)}>
      <SimpleRow title="Power Level" value={powerLevel} />
      <SimpleRow title="Accelerator" value={lastMessageData.accelerator / 255} />
      <div style={{ height: 24 }} />
    </Ripple>
  </div>;
}

function PowerCurveChart({ size, messageDataAnalysis, lastMessageData }: { size: { height: number; width: number; }; messageDataAnalysis: MessageDataAnalysis; lastMessageData: MessageData; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = React.useMemo(() => toData(messageDataAnalysis, unitSystem), [unitSystem, messageDataAnalysis.stamp]);
  const maxPower = wsTo(messageDataAnalysis.maxPower, unitSystem);
  return <AreaChart key={sizeToKey(size)} width={size.width} height={size.height} data={data}
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
    <XAxis dataKey="rpm" type="number" domain={[lastMessageData.engineIdleRpm, lastMessageData.engineMaxRpm]} allowDataOverflow={false}
      ticks={getTicks(lastMessageData.engineMaxRpm, lastMessageData.engineIdleRpm, 1000)} />
    <YAxis yAxisId={1} type="number" domain={([, max]) => { return [0, max * 1.05]; }} hide />
    <YAxis yAxisId={0} type="number" domain={([, max]) => { return [0, max * 1.05]; }}
      ticks={maxPower === 0 ? [0] : [0, maxPower / 2, maxPower]}
      tickFormatter={value => value.toFixed(1)} />
    <CartesianGrid strokeDasharray="3 3" horizontalValues={[maxPower / 4, maxPower / 2, maxPower * 3 / 4, maxPower]} />
    <Tooltip formatter={(value, name) => {
      switch (name) {
        case "power":
          return `${(value as number).toFixed(1)} (${((value as number) / maxPower * 100).toFixed(1)}%)`;
        default:
          return (value as number).toFixed(1);
      }
    }} contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
    <Legend />
    <Area yAxisId={1} type="monotone" dataKey="torque" stroke="#8884d8" fillOpacity={1} fill="url(#colorTorque)" />
    <Area yAxisId={0} type="monotone" dataKey="power" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPower)" />
  </AreaChart>;
}

function PowerLevelChart({ size, messageDataAnalysis, messageData }: { size: { height: number; width: number; }; messageDataAnalysis: MessageDataAnalysis; messageData: CircularBuffer<MessageData>; }) {
  const data = messageData.map((data, index) => {
    return { index, "power level": Math.max(data.power / messageDataAnalysis.maxPower, 0) * 100 };
  });
  return <AreaChart key={sizeToKey(size)} width={size.width} height={size.height} data={data}
    margin={{ top: 0, right: chartsPadding + 4, left: chartsPadding - 16 }}>
    <defs>
      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
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
    <Area yAxisId={1} type="monotone" dataKey="power level" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPower)" unit="%" />
  </AreaChart>;
}

function toData(messageAnalysis: MessageDataAnalysis, unit: UnitSystem) {
  const data: { rpm: number; torque: number; power: number; }[] = [];
  for (const [rpm, { power, torque }] of Object.entries(messageAnalysis.powerCurve)) {
    data.push({ rpm: parseInt(rpm), power: wsTo(power, unit), torque: nmTo(torque, unit) });
  }
  const res = data.sort((a, b) => a.rpm - b.rpm);

  // only show part of data, reduce render work

  const reduceItems = [];
  for (let i = 0; i < res.length; i++) {
    const data = res[i];
    let lastData: {
      rpm: number;
      torque: number;
      power: number;
    }[] = [];
    lastData.push(data);
    for (; i < res.length && (res[i].rpm - data.rpm) < 20; i++) { // every 20 rpm show 1 data
      lastData.push(res[i]);
    }
    i -= 1;
    lastData = lastData.sort((a, b) => b.power - a.power);
    const theMaxPower = lastData[0]; // use the max power data to reduce data noise
    reduceItems.push(theMaxPower);

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
  return <Card style={{ flexGrow: "1", maxWidth: 240, height: "100%" }}>
    <Ripple className="fill-parent flex-column" style={{ justifyContent: "space-evenly", alignItems: "center", borderRadius: "var(--_container-shape, 12px)" }}
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
