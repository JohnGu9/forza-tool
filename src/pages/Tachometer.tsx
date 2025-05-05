import "./Tachometer.scss";

import { FadeThrough, SharedAxis } from "material-design-transform";
import React from "react";
import { Card, Ripple, Typography } from "rmcw/dist/components3";

import { AppWindowMode, ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { dummyMessageData, isValidProp, MessageData } from "../common/MessageData";
import { ConsumptionEstimation, MessageDataAnalysis, rpmToKey } from "../common/MessageDataAnalysis";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

const columnHeight = 150;

export default function Tachometer() {
  const { padding } = React.useContext(ReactWindowContext);
  const { appWindowMode } = React.useContext(ReactAppContext);
  const showMore = appWindowMode === AppWindowMode.Single;
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const [showPowerLevel, setShowPowerLevel] = React.useState(false);
  const switchDisplay = React.useCallback(() => setShowPowerLevel(value => !value), []);
  const lastData = messageData.getLast() ?? { currentEngineRpm: 0, engineMaxRpm: 6000, power: 0, gear: 0, accelerator: 0 };
  const { lower, upper } = getRange(messageDataAnalysis);
  const powerLevel = messageDataAnalysis.maxPower.value === 0 ? 0 : Math.max(lastData.power / messageDataAnalysis.maxPower.value, 0);
  const isInRange = lastData.currentEngineRpm >= lower && lastData.currentEngineRpm < upper;
  const lowPowerLevel = powerLevel < 0.9 && messageDataAnalysis.isFullAcceleratorForAWhile;
  function getColors() {
    if (lowPowerLevel) {
      return {
        color: "var(--md-sys-color-background)",
        graphColor: "var(--md-sys-color-error)",
        backgroundColor: "var(--md-sys-color-error)",
      };
    }
    if (isInRange) {
      if (powerLevel > 0.99) {
        return {
          color: "var(--md-sys-color-background)",
          graphColor: "var(--md-sys-color-tertiary)",
          backgroundColor: "var(--md-sys-color-tertiary)",
        };
      }
      return {
        color: "var(--md-sys-color-tertiary)",
        graphColor: "var(--md-sys-color-tertiary)",
        backgroundColor: undefined,
      };
    }
    return {
      color: "var(--md-sys-color-primary)",
      graphColor: "var(--md-sys-color-primary)",
      backgroundColor: undefined,
    };
  }
  const colors = getColors();

  function getAngle(startAngle: number, endAngle: number, r: number) {
    return startAngle * (1 - r) + endAngle * r;
  }

  const ref = useEcharts<HTMLDivElement>((style) => {
    return {
      xAxis: undefined,
      yAxis: undefined,
      angleAxis: [
        {
          polarIndex: 0,
          startAngle: 225,
          endAngle: -45,
          max: lastData.engineMaxRpm,
          axisLabel: {
            formatter: (value: number) => {
              return value.toFixed(0);
            }
          },
        },
        {
          polarIndex: 1,
          startAngle: 315,
          endAngle: 225,
          max: 1,
          axisLabel: {
            customValues: [0.2, 0.4, 0.6, 0.8],
            formatter: (value: number) => {
              return `${(value * 100).toFixed(0)}%`;
            }
          },
        },
      ],
      radiusAxis: [
        {
          type: "category",
          polarIndex: 0,
          data: ["RPM"],
          axisLabel: {
            show: false,
          },
        },
        {
          type: "category",
          polarIndex: 1,
          data: ["Power Level"],
          axisLabel: {
            show: false,
          },
        },
      ],
      polar: [
        {
          radius: ["75%", "90%"]
        },
        {
          radius: ["75%", "90%"]
        },
      ],
      series: [
        {
          type: "bar",
          coordinateSystem: "polar",
          polarIndex: 0,
          data: [
            {
              value: lastData.currentEngineRpm,
              itemStyle: {
                color: style.getPropertyValue("--md-sys-color-primary"),
                borderColor: style.getPropertyValue("--md-sys-color-primary"),
                borderWidth: isInRange ? 4 : 0,
                borderRadius: "2%",
              },
              tooltip: {
                valueFormatter: (currentEngineRpm: number) => {
                  return currentEngineRpm.toFixed(1);
                },
              },
            },
          ],
        },
        {
          type: "bar",
          polarIndex: 1,
          data: [
            {
              value: powerLevel,
              itemStyle: {
                color: style.getPropertyValue(colors.graphColor.slice(4, -1)),
                borderColor: style.getPropertyValue(colors.graphColor.slice(4, -1)),
                borderWidth: isInRange ? 4 : 0,
                borderRadius: "2%",
              },
              tooltip: {
                valueFormatter: (powerLevel: number) => {
                  return `${(powerLevel * 100).toFixed(1)}%`;
                },
              },
            },
          ],
          label: {
            show: true,
            position: "middle",
            rotate: 0,
            formatter: (params) => {
              return `${((params as { value: number; }).value * 100).toFixed(1)}%`;
            },
          },
          coordinateSystem: "polar",
        },
        {
          type: "pie",
          z: 3,
          radius: ["75%", "90%"],
          center: ["50%", "50%"],
          // adjust the start and end angle
          startAngle: getAngle(225, -45, lower / lastData.engineMaxRpm),
          endAngle: getAngle(225, -45, Math.max(upper, lower + 0.001) / lastData.engineMaxRpm),
          data: [
            {
              name: "High Power RPM Range",
              value: 1,
              labelLine: {
                lineStyle: {
                  color: style.getPropertyValue("--md-sys-color-tertiary"),
                },
              },
              itemStyle: {
                color: "rgba(0, 0, 0, 0)",
                borderColor: style.getPropertyValue("--md-sys-color-tertiary"),
                borderWidth: 8,
                borderRadius: "2%",
              },
              tooltip: {
                valueFormatter: () => {
                  return `${lower.toFixed(0)} - ${upper.toFixed(0)}`;
                },
              },
            },
          ]
        },
        {
          type: "pie",
          silent: true,
          z: 2,
          radius: ["75%", "90%"],
          center: ["50%", "50%"],
          // adjust the start and end angle
          startAngle: getAngle(225, -45, lower / lastData.engineMaxRpm),
          endAngle: getAngle(225, -45, Math.max(Math.min(lastData.currentEngineRpm, upper), lower + 0.001) / lastData.engineMaxRpm),
          data: [
            {
              value: 1,
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
              itemStyle: {
                color: style.getPropertyValue("--md-sys-color-tertiary"),
                borderColor: style.getPropertyValue("--md-sys-color-tertiary"),
                borderWidth: 4,
                borderRadius: "2%",
              },
            },
          ]
        },
        {
          type: "pie",
          silent: true,
          z: 2,
          radius: ["75%", "90%"],
          center: ["50%", "50%"],
          // adjust the start and end angle
          startAngle: getAngle(225, -45, upper / lastData.engineMaxRpm),
          endAngle: getAngle(225, -45, Math.max(lastData.currentEngineRpm, upper + 0.001) / lastData.engineMaxRpm),
          data: [
            {
              value: 1,
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
              itemStyle: {
                color: style.getPropertyValue("--md-sys-color-error"),
                borderColor: style.getPropertyValue("--md-sys-color-error"),
                borderWidth: 4,
                borderRadius: "2%",
              },
            },
          ]
        },
      ]
    };
  });
  return <div className="fill-parent flex-column" style={{ padding, gap: 16 }}>
    <RpmIndicatorLights lower={lower} upper={upper} current={lastData.currentEngineRpm} />
    <div className="flex-child" style={{ position: "relative" }}>
      <div ref={ref} className="fill-parent" style={{ position: "absolute" }} />
      <GearMonitor gear={lastData.gear} colors={colors} />
    </div>
    <SharedAxis keyId={showPowerLevel ? 1 : 0}
      className="flex-row flex-space-between" style={{ height: columnHeight, alignItems: "stretch", gap: 16 }}>
      {showPowerLevel ?
        <PowerLevelChart messageData={messageData} messageDataAnalysis={messageDataAnalysis} onClick={switchDisplay} /> :
        <>
          <ConsumptionEstimationCard messageData={messageData} messageDataAnalysis={messageDataAnalysis} onClick={switchDisplay} />
          <SimpleCard title="High Power RPM Range" content={`${lower.toFixed(0)} - ${upper.toFixed(0)}`} tooltip={`Rev / Min`} onClick={switchDisplay} />
          {showMore ? <SimpleCard title="Power Level" content={`${(powerLevel * 100).toFixed(1)}%`} tooltip={``} onClick={switchDisplay} /> : undefined}
        </>}
    </SharedAxis>
  </div>;
}

function GearMonitor({ gear, colors }: { gear: number; colors: { color?: string, backgroundColor?: string; }; }) {
  function gearToString(gear: number) {
    if (gear === 0) {
      return "R";
    }
    return gear;
  }
  return <div className="tachometer-background flex-column flex-space-between" style={{ justifyContent: "center" }}>
    <FadeThrough keyId={gear} transitionStyle="M2" className="flex-column flex-space-evenly tachometer-gear-position">
      <Card className="tachometer-round-shape">
        <div className="fill-parent flex-column flex-center tachometer-background-transition tachometer-round-shape"
          style={{ backgroundColor: colors.backgroundColor }}>
          <span title="Gear" className="tachometer-gear" style={{ color: colors.color }}>
            {gearToString(gear)}
          </span>
        </div>
      </Card>
    </FadeThrough>
  </div>;
}

function getRange(messageDataAnalysis: MessageDataAnalysis) {
  const sorted = messageDataAnalysis.powerCurve.map(({ rpm, power }) => {
    const key = rpmToKey(rpm);
    return { x: rpm, y: power, key };
  });
  if (sorted.length === 0) {
    return { lower: 0, upper: 0 };
  }
  const maxKey = rpmToKey(messageDataAnalysis.maxPower.rpm);
  const maxIndex = sorted.findIndex(data => data.key === maxKey);
  if (maxIndex === -1) {
    return { lower: 0, upper: 0 };
  }
  const threshold97 = messageDataAnalysis.maxPower.value * 0.97;
  const { lower, upper } = getBound(sorted, maxIndex, threshold97);
  return { lower: sorted[lower].x, upper: sorted[upper].x };
}

function getBound(sorted: { x: number, y: number; }[], maxIndex: number, threshold: number) {
  let upper = sorted.length - 1;
  for (let i = maxIndex + 1; i < sorted.length; i++) {
    if (sorted[i].y <= threshold) {
      upper = i;
      break;
    }
  }
  let lower = 0;
  for (let i = maxIndex - 1; i >= 0; i--) {
    if (sorted[i].y <= threshold) {
      lower = i;
      break;
    }
  }
  return { lower, upper };
}

function RpmIndicatorLights({ lower, upper, current }: { lower: number, upper: number, current: number; }) {
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

  function getContainerColor(lower: number, color: string) {
    if (!isMainSwitchOn) {
      return undefined;
    }
    if (progress <= lower) {
      return undefined;
    }
    return color;
  }

  return <div className="flex-row flex-space-between" style={{ gap: 12, height: 42, alignItems: "stretch" }}>
    {[
      { lower: 0.0, upper: 0.2, color: "var(--md-sys-color-tertiary)" },
      { lower: 0.2, upper: 0.4, color: "var(--md-sys-color-tertiary)" },
      { lower: 0.4, upper: 0.6, color: "var(--md-sys-color-primary)" },
      { lower: 0.6, upper: 0.8, color: "var(--md-sys-color-primary)" },
      { lower: 0.8, upper: 1.0, color: "var(--md-sys-color-error)" },
      { lower: 0.9, upper: 1.0, color: "var(--md-sys-color-error)" },
      { lower: 0.8, upper: 1.0, color: "var(--md-sys-color-error)" },
      { lower: 0.6, upper: 0.8, color: "var(--md-sys-color-primary)" },
      { lower: 0.4, upper: 0.6, color: "var(--md-sys-color-primary)" },
      { lower: 0.2, upper: 0.4, color: "var(--md-sys-color-tertiary)" },
      { lower: 0.0, upper: 0.2, color: "var(--md-sys-color-tertiary)" },].map(({ lower, color }, index) =>
        <Card key={index} className="flex-child" style={{ maxWidth: 120 }} >
          <div className="fill-parent fit-elevated-card-container-shape" style={{
            backgroundColor: getContainerColor(lower, color),
            transition: "background 100ms",
          }} />
        </Card>
      )}
  </div>;
}

function PowerLevelChart({ messageDataAnalysis, messageData, onClick }: { messageDataAnalysis: MessageDataAnalysis; messageData: CircularBuffer<MessageData>; onClick: () => unknown; }) {
  function getColor(powerLevel: number) {
    if (powerLevel >= 97) {
      return "--md-sys-color-tertiary";
    };
    if (powerLevel >= 90) {
      return "--md-sys-color-primary";
    };
    return "--md-sys-color-error";
  }
  const ref = useEcharts<HTMLDivElement>((style) => {
    return {
      grid: {
        left: 40,
        top: 8,
        right: 0,
        bottom: 8
      },
      tooltip: {
        show: true,
        trigger: "axis",
        formatter: (params) => {
          if (Array.isArray(params)) {
            params = params[0];
          }
          return `${(params as { value: number[]; }).value[1].toFixed(1)}%`;
        },
      },
      yAxis: {
        show: true,
        type: "value",
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value) => {
            return `${value}%`;
          },
        },
      },
      series: [
        {
          type: "bar",
          data: messageData.map((data, index) => {
            const powerLevel = Math.max(data.power / messageDataAnalysis.maxPower.value, 0) * 100;
            return {
              value: [index, powerLevel],
              itemStyle: {
                color: style.getPropertyValue(getColor(powerLevel)),
              },
            };
          }),
          large: true,
        }
      ]
    };
  });
  return <Card className="flex-child">
    <Ripple className="fill-parent fit-elevated-card-container-shape" style={{ padding: 8 }} onClick={onClick}>
      <div ref={ref} className="fill-parent" />
    </Ripple>
  </Card>;
}


function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: React.ReactNode; onClick: () => unknown; }) {
  return <Card className="flex-child" style={{ maxWidth: 280, textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-between fit-elevated-card-container-shape" style={{ padding: 24 }}>
      <Typography.Title.Medium tag="span" title={tooltip}>{title}</Typography.Title.Medium>
      <Typography.Headline.Medium tag="span" title={tooltip}>{content}</Typography.Headline.Medium>
    </Ripple>
  </Card>;
}

function ConsumptionEstimationCard({ messageData, messageDataAnalysis, onClick }: { messageData: CircularBuffer<MessageData>, messageDataAnalysis: MessageDataAnalysis; onClick: () => unknown; }) {
  const lastData = messageData.getLast() ?? dummyMessageData;
  const perLapConsumption = messageDataAnalysis.consumptionEstimation.getPerLapConsumption();
  const remainEstimation = ConsumptionEstimation.estimateRemainLaps(perLapConsumption, lastData);

  return <Card className="flex-child" style={{ maxWidth: 280, textWrap: "nowrap" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column flex-space-between fit-elevated-card-container-shape" style={{ padding: 24, alignItems: "start" }}>
      <Typography.Title.Medium tag="span">Estimation</Typography.Title.Medium>
      <Typography.Title.Medium tag="span" className="flex-row flex-space-between" style={{ width: "100%", opacity: isValidProp(lastData.dataType, "fuel") ? 1 : 0.3 }}>
        Fuel:
        <span>
          <span title="Laps of Remain Fuel">{remainEstimation.fuel.toFixed(1)}</span><span style={{ paddingLeft: 8 }}>Laps</span>
        </span>
      </Typography.Title.Medium>
      <Typography.Title.Medium tag="span" className="flex-row flex-space-between" style={{ width: "100%", opacity: isValidProp(lastData.dataType, "tireWearFrontLeft") ? 1 : 0.3 }}>
        TireWear:
        <span>
          <span title="Laps of Until 50% Tire Wear">{remainEstimation.tireWear50.toFixed(1)}</span> / <span title="Laps of Until 65% Tire Wear">{remainEstimation.tireWear65.toFixed(1)}</span>
          <span style={{ paddingLeft: 8 }}>Laps</span>
        </span>
      </Typography.Title.Medium>
    </Ripple>
  </Card >;
}
