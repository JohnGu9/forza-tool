import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { AppWindowMode, ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import React from "react";
import { MessageDataAnalysis } from "../common/MessageData";
import { Card, Ripple, Typography } from "rmcw/dist/components3";
import { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";

const startAngle = 225;
const endAngle = -45;
const columnHeight = 150;

export default function Tachometer() {
  const { appWindowMode } = React.useContext(ReactAppContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const [showPowerLevel, setShowPowerLevel] = React.useState(appWindowMode === AppWindowMode.Single);

  const lastData = messageData.getLast() ?? { currentEngineRpm: 0, engineMaxRpm: 6000, power: 0, gear: 0 };
  const { lower, upper } = getRange(messageDataAnalysis);
  const markData = React.useMemo(() => getMarkData(lastData.engineMaxRpm, { lower, upper }), [lastData.engineMaxRpm, lower, upper]);
  const powerLevel = messageDataAnalysis.maxPower.value === 0 ? 0 : Math.max(lastData.power / messageDataAnalysis.maxPower.value, 0);
  const isRange = lastData.currentEngineRpm >= lower && lastData.currentEngineRpm < upper;
  return <div className="fill-parent flex-column" style={{ padding: "16px 32px", gap: 16 }}>
    <div className="flex-child" style={{ position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ bottom: -48 }}>
          {showPowerLevel ? <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="65%" fill={powerLevel > 0.97 ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)"} startAngle={startAngle} endAngle={getAngle(powerLevel, startAngle, endAngle)}
            stroke="var(--md-sys-color-on-background)"
            data={[{ name: "PowerLevel", value: powerLevel }]} /> : undefined}
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="80%" fill="var(--md-sys-color-primary)" startAngle={startAngle} endAngle={endAngle} paddingAngle={1}
            stroke="var(--md-sys-color-on-background)"
            data={markData}>
            {markData.map((data, index) =>
              <Cell key={index} fill={data.mark ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)"} />)}
          </Pie>
          <Pie isAnimationActive={false} dataKey="value" nameKey="name" innerRadius="85%" outerRadius="90%" fill={isRange ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)"} startAngle={startAngle} endAngle={getAngle(lastData.engineMaxRpm === 0 ? 0 : lastData.currentEngineRpm / lastData.engineMaxRpm, startAngle, endAngle)}
            stroke="var(--md-sys-color-on-background)"
            data={[{ name: "CurrentEngineRpm", value: lastData.currentEngineRpm }]} />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-column flex-space-evenly" style={{ position: "absolute", inset: 0, pointerEvents: "none", paddingTop: 32 }}>
        <Typography.Display.Large tag="span" title="Gear" style={{
          fontSize: "10vmax",
          color: isRange ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-primary)",
          transition: "color 200ms, text-shadow 100ms",
          textShadow: powerLevel > 0.99 ? "var(--md-sys-color-on-background) 0 0 20px" : undefined,
        }}>{lastData.gear}</Typography.Display.Large>
      </div>
    </div>
    <IndicatorLights lower={lower} upper={upper} current={lastData.currentEngineRpm} />
    <div className="flex-row flex-space-between" style={{ height: columnHeight, alignItems: "stretch", gap: 16, padding: "0 0 16px" }}>
      <SimpleCard title="RPM" content={lastData.currentEngineRpm.toFixed(0)} tooltip={`Rev / Min`} onClick={() => setShowPowerLevel(!showPowerLevel)} />
      <SimpleCard title="High Power RPM Range" content={`${lower.toFixed(0)} - ${upper.toFixed(0)}`} tooltip={`Rev / Min`} onClick={() => setShowPowerLevel(!showPowerLevel)} />
      {showPowerLevel ? <SimpleCard title="Power Level" content={`${(powerLevel * 100).toFixed(1)}%`} tooltip={``} onClick={() => setShowPowerLevel(!showPowerLevel)} /> : undefined}
    </div>
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
  console.log(maxIndex, threshold97, lower, upper);
  return { lower: sorted[lower].x, upper: sorted[upper].x };
}

function getBound(sorted: { x: number, y: number; }[], maxIndex: number, threshold: number) {
  let upper = sorted.length - 1;
  for (let i = maxIndex + 1; i < sorted.length; i++) {
    const data = sorted[i];
    if (data.y < threshold) {
      upper = i;
      break;
    }
  }
  let lower = 0;
  for (let i = maxIndex - 1; i >= 0; i--) {
    const data = sorted[i];
    if (data.y < threshold) {
      lower = i;
      break;
    }
  }
  return { lower, upper };
}

function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: React.ReactNode; onClick: () => unknown; }) {
  return <Card className="flex-child" style={{ maxWidth: 280, textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-evenly" style={{ borderRadius: "var(--_container-shape, 12px)", padding: "0 32px", overflow: "clip" }}>
      <Typography.Title.Medium tag='span' title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}


function IndicatorLights({ lower, upper, current }: { lower: number, upper: number, current: number; }) {
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

  const [show, setShow] = React.useState(true);
  const over = progress >= 1;
  React.useEffect(() => {
    if (over) {
      const timer = setInterval(() => setShow(value => !value), 300);
      return () => {
        clearInterval(timer);
        setShow(true);
      };
    }
  }, [over]);

  function getContainerColor(lower: number, upper: number) {
    if (!show ||
      lower === upper ||
      progress <= lower) {
      return undefined;
    }
    return progress < upper && !over ? "var(--md-sys-color-primary)" : "var(--md-sys-color-tertiary)";
  }

  return <div className="flex-row flex-space-between" style={{ gap: 16, height: 32, alignItems: "stretch" }}>
    {[{ lower: 0, upper: 0.2 }, { lower: 0.2, upper: 0.4 }, { lower: 0.4, upper: 0.6 }, { lower: 0.6, upper: 0.8 }, { lower: 0.8, upper: 1 }].map(({ lower, upper }, index) =>
      <Card key={index} className="flex-child" style={{
        maxWidth: 120,
        "--md-elevated-card-container-color": getContainerColor(lower, upper),
        "--md-elevated-card-container-shadow-color": over ? "var(--md-sys-color-tertiary)" : undefined,
      } as React.CSSProperties} />
    )}
  </div>;
}
