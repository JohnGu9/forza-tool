import React from "react";
import { Card, ListItem } from "rmcw/dist/components3";

import { ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

export default function WindResistance() {
  const { padding } = React.useContext(ReactWindowContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const data = getDate(messageData);
  const { K, C, r, slope, intercept } = getWindResistance(data);
  const ref = useEcharts<HTMLDivElement>(() => {
    return {
      grid: {
        left: 64,
        top: 32,
        right: 24,
        bottom: 24
      },
      legend: {},
      yAxis: [
        {
          type: "value",
          min: 0,
          max: "dataMax",
          axisLabel: {
            formatter: (value) => {
              return value.toFixed(5);
            },
          },
        },
        {
          type: "value",
          min: 0,
          max: "dataMax",
          axisLabel: {
            show: false,
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
        },
        {
          type: "value",
          min: 0,
          max: "dataMax",
          show: false,
        },
        {
          type: "value",
          min: 0,
          max: "dataMax",
          show: false,
        },
        {
          type: "value",
          min: 0,
          max: "dataMax",
          show: false,
        },
      ],
      series: [
        {
          type: "line",
          yAxisIndex: 0,
          name: "Kinetic Energy Increment / Engine Power",
          data: data.map((value, index) => [index, value.ratio]),
          areaStyle: {
            opacity: 0.8,
          },
          symbolSize: 0,
          smooth: true,
        },
        {
          type: "line",
          yAxisIndex: 1,
          name: "Power",
          data: data.map((value, index) => [index, value.power]),
          areaStyle: {
            opacity: 0.2,
          },
          symbolSize: 0,
          smooth: true,
          tooltip: {
            valueFormatter(value) {
              return `${value} W`;
            },
          },
        },
        {
          type: "line",
          yAxisIndex: 2,
          name: "Speed",
          data: data.map((value, index) => [index, value.speed]),
          areaStyle: {
            opacity: 0.2,
          },
          symbolSize: 0,
          smooth: true,
          tooltip: {
            valueFormatter(value) {
              return `${value} m/s`;
            },
          },
        },
        {
          type: "line",
          yAxisIndex: 3,
          name: "Acceleration",
          data: data.map((value, index) => [index, value.acceleration]),
          areaStyle: {
            opacity: 0.2,
          },
          symbolSize: 0,
          smooth: true,
          tooltip: {
            valueFormatter(value) {
              return `${value}`;
            },
          },
        },
        {
          type: "line",
          yAxisIndex: 4,
          name: "Kinetic Energy Increment",
          data: data.map((value, index) => [index, value.kineticEnergyIncrement]),
          areaStyle: {
            opacity: 0.2,
          },
          symbolSize: 0,
          smooth: true,
          tooltip: {
            valueFormatter(value) {
              return `${value}`;
            },
          },
        },
      ],
    };
  });

  const ref0 = useEcharts<HTMLDivElement>(() => {
    return {
      grid: {
        left: 64,
        top: 16,
        right: 24,
        bottom: 24
      },
      legend: {},
      yAxis: {
        type: "value",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          formatter: (value) => {
            return value.toFixed(5);
          },
        },
      },
      series: [
        {
          type: "line",
          data: r,
        },
        {
          type: "line",
          silent: true,
          showSymbol: false,
          data: r.length < 2 ? [] : [
            [r[0][0], r[0][0] * slope + intercept],
            [r[r.length - 1][0], r[r.length - 1][0] * slope + intercept]
          ],
        },
      ]
    };
  });
  return <div className="fill-parent flex-column" style={{ padding, gap: 16 }}>
    <Card className="flex-child" style={{ paddingTop: 8 }}>
      <div ref={ref} className="fill-parent" />
    </Card>
    <Card className="flex-row" style={{ height: 160 }}>
      <div className="flex-column" style={{ width: 300, justifyContent: "space-around" }}>
        <ListItem
          supportingText="Wind Resistance">
          {K}
        </ListItem>
        <ListItem
          supportingText="Kinetic Energy Increment / Effective Power">
          {C}
        </ListItem>
      </div>
      <div ref={ref0} className="flex-child" />
    </Card>
  </div>;
}

type Data = { power: number, speed: number, acceleration: number, kineticEnergyIncrement: number, ratio: number; };

function getDate(messageData: CircularBuffer<MessageData>) {
  if (messageData.getElementCount() < 2) {
    return [];
  }
  const data = [...messageData];
  const res = new Array<Data>(data.length - 1);
  for (let i = 0; i < data.length - 1; i++) {
    const a = data[i];
    const b = data[i + 1];
    const acceleration = b.speed - a.speed;
    const kineticEnergyIncrement = (b.speed + a.speed) * acceleration;
    res[i] = {
      power: b.power,
      speed: b.speed,
      acceleration,
      kineticEnergyIncrement,
      ratio: (acceleration < 0 || b.power < 0 || a.power < 0) ? 0 : (kineticEnergyIncrement / (b.power + a.power)),
    };
  }
  return res;
}

// Draw conclusions:
// * Conclusions only work for car is driving on a level surface
//
// d(v)                                            ~ d(v) is differential of v
// kinetic energy = 1/2 * m * v^2                  ~ v mean speed
// d(kinetic energy) = P * d(t)                    ~ P mean effective power
// 1/2 * m * (v1^2 - v0^2) = P * d(t)
// (v1^2 - v0^2) / P = 2 * d(t) / m = C            ~ C is some const, assume m and d(t) is const
// P = P(engine) - P(wind) - P(other resistance)   ~ assume P(other resistance) = 0
// P(wind) = F(wind) * v
// F(wind) = K * v^2                               ~ K is some const, is wind resistance factor
// P(wind) = K * v^3
// 
// (v1^2 - v0^2) / (P(engine) - K * v^3) = C 
// (v1^2 - v0^2) / P(engine) = - K * C * v^3 / P(engine) + C
//
// let y = (v1^2 - v0^2) / P(engine)
//     x = v^3 / P(engine)
//     a = - K * C
//     b = C
// y = a * x + b
//
// linear regression

function getWindResistance(data: Data[]) {
  const d = data.filter(v => v.ratio !== 0);
  const r = d.map<[number, number]>(v => [Math.pow(v.speed, 3) / v.power, v.kineticEnergyIncrement / v.power])
    .sort((a, b) => a[1] - b[1])
    .slice(Math.floor(d.length / 32), Math.ceil(d.length * 31 / 32))
    .sort((a, b) => a[0] - b[0])
    .slice(Math.floor(d.length / 16), Math.ceil(d.length * 7 / 8));
  const { slope, intercept } = linearRegression(r);
  const C = intercept;
  const K = - slope / C;
  return { K, C, r, slope, intercept };
}

function linearRegression(data: [number, number][]) {
  let xSum = 0, ySum = 0, xxSum = 0, xySum = 0;
  const count = data.length;
  for (let i = 0; i < count; i++) {
    xSum += data[i][0];
    ySum += data[i][1];
    xxSum += data[i][0] * data[i][0];
    xySum += data[i][0] * data[i][1];
  }

  const slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
  const intercept = (ySum / count) - (slope * xSum) / count;

  return { slope, intercept };
}
