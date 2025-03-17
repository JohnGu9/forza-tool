import "./Tachometer.scss";

import { FadeThrough, SharedAxis } from "material-design-transform";
import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Button, Card, Dialog, Divider, ListItem, Ripple, Typography } from "rmcw/dist/components3";

import { AppWindowMode, ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData, MessageDataAnalysis } from "../common/MessageData";

const startAngle = 225;
const endAngle = -45;
const columnHeight = 150;

export default function Tachometer() {
  const { appWindowMode } = React.useContext(ReactAppContext);
  const showMore = appWindowMode === AppWindowMode.Single;
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const [showPowerLevel, setShowPowerLevel] = React.useState(false);
  const switchDisplay = React.useCallback(() => setShowPowerLevel(value => !value), []);
  const lastData = messageData.getLast() ?? { currentEngineRpm: 0, engineMaxRpm: 6000, power: 0, gear: 0, accelerator: 0 };
  const { lower, upper } = getRange(messageDataAnalysis);
  const markData = React.useMemo(() => getMarkData(lastData.engineMaxRpm, { lower, upper }), [lastData.engineMaxRpm, lower, upper]);
  const powerLevel = messageDataAnalysis.maxPower.value === 0 ? 0 : Math.max(lastData.power / messageDataAnalysis.maxPower.value, 0);
  const isRange = lastData.currentEngineRpm >= lower && lastData.currentEngineRpm < upper;
  const lowPowerLevel = powerLevel < 0.9 && messageDataAnalysis.isFullAcceleratorForAWhile;
  function getColor() {
    if (lowPowerLevel) {
      return "var(--md-sys-color-error)";
    }
    if (isRange) {
      return "var(--md-sys-color-tertiary)";
    }
    return "var(--md-sys-color-primary)";
  }
  return <div className="fill-parent flex-column" style={{ padding: "16px", gap: 16 }}>
    <div className="flex-child" style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ bottom: -48 }}>
          {showMore && !showPowerLevel ? <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="65%" fill={powerLevel > 0.97 ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)"} startAngle={startAngle} endAngle={getAngle(powerLevel, startAngle, endAngle)}
            stroke="var(--md-sys-color-on-background)"
            data={[{ name: "PowerLevel", value: powerLevel }]} /> : undefined}
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="80%" fill="var(--md-sys-color-primary)" startAngle={startAngle} endAngle={endAngle} paddingAngle={1}
            stroke="var(--md-sys-color-on-background)"
            data={markData}>
            {markData.map((data, index) =>
              <Cell key={index} fill={data.mark ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)"} />)}
          </Pie>
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="85%" outerRadius="90%" fill={getColor()} startAngle={startAngle} endAngle={getAngle(lastData.engineMaxRpm === 0 ? 0 : lastData.currentEngineRpm / lastData.engineMaxRpm, startAngle, endAngle)}
            stroke="var(--md-sys-color-on-background)"
            data={[{ name: "CurrentEngineRpm", value: lastData.currentEngineRpm }]} />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <FadeThrough keyId={lastData.gear} transitionStyle="M2" className="flex-column flex-space-evenly tachometer-gear-position">
        <Typography.Display.Large tag="span" title="Gear" className="tachometer-gear" style={{
          color: getColor(),
          fontSize: powerLevel > 0.99 ? "8vmax" : undefined,
          outline: powerLevel > 0.99 ? "1rem solid" : "0rem solid",
        } as React.CSSProperties}>{lastData.gear}</Typography.Display.Large>
      </FadeThrough>
    </div>
    <IndicatorLights lower={lower} upper={upper} current={lastData.currentEngineRpm} lowPowerLevel={lowPowerLevel} />
    <SharedAxis keyId={showPowerLevel ? 1 : 0}
      className="flex-row flex-space-between" style={{ height: columnHeight, alignItems: "stretch", gap: 16 }}>
      {showPowerLevel ?
        <PowerLevelChart messageData={messageData} messageDataAnalysis={messageDataAnalysis} onClick={switchDisplay} /> :
        <>
          <SimpleCard title="RPM" content={lastData.currentEngineRpm.toFixed(0)} tooltip={`Rev / Min`} onClick={switchDisplay} />
          <SimpleCard title="High Power RPM Range" content={`${lower.toFixed(0)} - ${upper.toFixed(0)}`} tooltip={`Rev / Min`} onClick={switchDisplay} />
          {showMore ? <SimpleCard title="Power Level" content={`${(powerLevel * 100).toFixed(1)}%`} tooltip={``} onClick={switchDisplay} /> : undefined}
        </>}
    </SharedAxis>
  </div>;
}

function CustomTooltip({ active, payload }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    function getText(payload: Payload<ValueType, NameType>[]) {
      switch (payload[0].name) {
        case "CurrentEngineRpm":
          return `${payload[0].name} : ${(payload[0].value as number).toFixed(1)}`;
        case "PowerLevel":
          return `${payload[0].name} : ${(payload[0].value as number * 100).toFixed(1)}%`;
        default:
          return payload[0].name;
      }
    }
    return (
      <div style={{ backgroundColor: "var(--md-sys-color-surface)", padding: "8px 16px", border: "solid", borderColor: "var(--md-sys-color-on-surface)" }}>
        <p >{getText(payload)}</p>
      </div>
    );
  }
  return null;
};

function getMarkData(max: number, range: { lower: number, upper: number; }) {
  const res: { name: string; value: number; mark: boolean; }[] = [];
  function addSection(start: number, end: number, mark = false) {
    res.push({ name: `RPM: ${start.toFixed(1)} - ${end.toFixed(1)}`, value: (end - start), mark });
  }

  const beforeLower = Math.floor(range.lower / 1000);
  for (let i = 0; i < beforeLower; i++) {
    addSection(i * 1000, (i + 1) * 1000);
  }
  const beforeLowerMod = range.lower % 1000;
  addSection(beforeLower * 1000, beforeLower * 1000 + beforeLowerMod);

  const afterUpper = Math.floor(range.upper / 1000);
  const afterUpperMod = range.upper % 1000;

  if (afterUpper !== beforeLower) {
    addSection(beforeLower * 1000 + beforeLowerMod, (beforeLower + 1) * 1000, true);
    for (let i = beforeLower + 1; i < afterUpper; i++) {
      addSection(i * 1000, (i + 1) * 1000, true);
    }
    addSection(afterUpper * 1000, afterUpper * 1000 + afterUpperMod, true);
  } else { // afterUpper === beforeLower
    addSection(beforeLower * 1000 + beforeLowerMod, afterUpper * 1000 + afterUpperMod, true);
  }

  if ((afterUpper + 1) * 1000 < max) {
    addSection(afterUpper * 1000 + afterUpperMod, (afterUpper + 1) * 1000);
    const rest = Math.floor(max / 1000);
    for (let i = afterUpper + 1; i < rest; i++) {
      addSection(i * 1000, (i + 1) * 1000);
    }
    const restMod = max % 1000;
    addSection(rest * 1000, rest * 1000 + restMod);
  } else {
    addSection(afterUpper * 1000 + afterUpperMod, max);
  }

  return res;
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
  const maxIndex = sorted.findIndex(data => data.key === maxKey);
  if (maxIndex === -1) {
    return { lower: 0, upper: 0 };
  }
  const threshold97 = messageDataAnalysis.maxPower.value * 0.97;
  const { lower, upper } = getBound(sorted, maxIndex, threshold97);
  return { lower: sorted[lower].x, upper: sorted[upper].x };
}

function getBound(sorted: { x: number, y: number; }[], maxIndex: number, threshold: number, bundleRange = 100) {
  let upper = sorted.length - 1;
  function filterNoise(bundle: number[]) {
    const sorted = bundle.sort(function (a, b) { return a - b; });
    function filter(bundle: number[]) {
      if (bundle.length < 8) {
        return bundle.slice(Math.floor(bundle.length / 2));
      }
      return bundle.slice(Math.ceil(bundle.length / 2), Math.floor(0.9 * bundle.length));
    }
    return filter(sorted);
  }
  function getAverage(bundle: number[]) {
    return bundle.reduce(function (sum, value) { return sum + value; }, 0) / bundle.length;
  }
  for (let i = maxIndex + 1; i < sorted.length;) {
    const bundle = [sorted[i]];
    const startIndex = i;
    for (i++; i < sorted.length && sorted[i].x - bundle[0].x < bundleRange; i++) {
      bundle.push(sorted[i]);
    }
    const average = getAverage(filterNoise(bundle.map(v => v.y)));
    if (average < threshold) {
      upper = startIndex;
      break;
    }
  }
  let lower = 0;
  for (let i = maxIndex - 1; i >= 0;) {
    const bundle = [sorted[i]];
    const startIndex = i;
    for (i--; i >= 0 && bundle[0].x - sorted[i].x < bundleRange; i--) {
      bundle.push(sorted[i]);
    }
    const average = getAverage(filterNoise(bundle.map(v => v.y)));
    if (average < threshold) {
      lower = startIndex;
      break;
    }
  }
  return { lower, upper };
}

function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: React.ReactNode; onClick: () => unknown; }) {
  return <Card className="flex-child" style={{ maxWidth: 280, textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-evenly fit-elevated-card-container-shape" style={{ padding: "0 32px" }}>
      <Typography.Title.Medium tag='span' title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}


function IndicatorLights({ lower, upper, current, lowPowerLevel }: { lower: number, upper: number, current: number; lowPowerLevel: boolean; }) {
  function getProgress(lower: number, upper: number, current: number) {
    if (lower === upper) {
      return 0;
    }
    if (current < lower) {
      return 0;
    }
    return (current - lower) / (upper - lower);
  }
  const progress = getProgress(lower, upper, current);

  const [isOpenDialog, setOpenDialog] = React.useState(false);
  const openDialog = React.useCallback(() => setOpenDialog(true), []);
  const closeDialog = React.useCallback(() => setOpenDialog(false), []);
  const [isMainSwitchOn, setMainSwitchOn] = React.useState(true);
  const overProgress = progress >= 1;
  React.useEffect(() => {
    if (overProgress) {
      const timer = setInterval(() => setMainSwitchOn(value => !value), 200);
      return () => {
        clearInterval(timer);
        setMainSwitchOn(true);
      };
    }
  }, [overProgress]);

  function getContainerColor(lower: number) {
    if (!isMainSwitchOn) {
      return undefined;
    }
    if (lowPowerLevel) {
      return "var(--md-sys-color-error)";
    }
    if (progress <= lower) {
      return undefined;
    }
    return overProgress ? "var(--md-sys-color-primary)" : "var(--md-sys-color-tertiary)";
  }

  return <>
    <div className="flex-row flex-space-between" style={{ gap: 32, height: 32, alignItems: "stretch" }}>
      {[{ lower: 0, upper: 0.2 },
      { lower: 0.2, upper: 0.4 },
      { lower: 0.4, upper: 0.6 },
      { lower: 0.6, upper: 0.8 },
      { lower: 0.8, upper: 1 }].map(({ lower }, index) =>
        <Card key={index} className="flex-child" style={{
          maxWidth: 120,
          "--md-elevated-card-container-color": getContainerColor(lower),
          "--md-elevated-card-container-shadow-color": overProgress ? "var(--md-sys-color-tertiary)" : undefined,
        } as React.CSSProperties} >
          <Ripple className="fill-parent fit-elevated-card-container-shape" onClick={openDialog} />
        </Card>
      )}
    </div>
    <Dialog open={isOpenDialog}
      headline="Explanation"
      actions={<Button buttonStyle="text" onClick={closeDialog}>close</Button>}
      onScrimClick={closeDialog}>
      <ListItem trailingSupportingText={
        <Card className="demo-card" style={{ "--md-elevated-card-container-color": "var(--md-sys-color-tertiary)" } as React.CSSProperties} />
      } supportingText="97% or higher">High Power</ListItem>
      <Divider />
      <ListItem trailingSupportingText={
        <Card className="demo-card" style={{ "--md-elevated-card-container-color": "var(--md-sys-color-primary)" } as React.CSSProperties} />
      } supportingText="90% or higher">Normal Power</ListItem>
      <Divider />
      <ListItem trailingSupportingText={
        <Card className="demo-card" style={{ "--md-elevated-card-container-color": "var(--md-sys-color-error)" } as React.CSSProperties} />
      } supportingText="below 90%">Low Power</ListItem>
    </Dialog>
  </>;
}

function PowerLevelChart({ messageDataAnalysis, messageData, onClick }: { messageDataAnalysis: MessageDataAnalysis; messageData: CircularBuffer<MessageData>; onClick: () => unknown; }) {
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
  return <Card className="flex-child">
    <Ripple className="fill-parent fit-elevated-card-container-shape" style={{ padding: 8 }} onClick={onClick}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart title="PowerLevel" data={data} margin={{ left: -56, bottom: -24, top: 4, right: 4 }}>
          <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} tick={false} />
          <YAxis yAxisId={1} type="number" domain={[0, 100]} tick={false} allowDataOverflow={false} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(value) => { return (value as number).toFixed(1); }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Bar yAxisId={1} dataKey="power level" fill="var(--md-sys-color-tertiary)" unit="%" isAnimationActive={false} >
            {data.map((value) =>
              <Cell key={value.index} fill={getColor(value)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Ripple>
  </Card>;
}
