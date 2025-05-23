import { inverse, Matrix } from 'ml-matrix';
import React from "react";
import { Card, Icon, ListItem, Typography } from "rmcw/dist/components3";

import { ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { isValidPowerDiff, MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

export default function AirDragCoefficient() {
  const { padding } = React.useContext(ReactWindowContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const data = getDate(messageData, messageDataAnalysis);
  const { K, C } = getWindResistance(data);
  const ref = useEcharts<HTMLDivElement>(() => {
    return {
      grid: {
        left: 64,
        top: 32,
        right: 24,
        bottom: 24
      },
      legend: {
        type: "scroll",
      },
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
          data: data.map((value, index) => [index, value.data.power]),
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
          data: data.map((value, index) => [index, value.data.speed]),
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
      ],
    };
  });

  return <div className="fill-parent flex-column" style={{ padding, gap: 16 }}>
    <Card className="flex-child" style={{ paddingTop: 8 }}>
      <div ref={ref} className="fill-parent" />
    </Card>
    <Card className="flex-column" >
      <ListItem
        supportingText="Air Drag Coefficient"
        end={<Icon>air</Icon>}>
        {K}
      </ListItem>
      <ListItem
        supportingText="Kinetic Energy Increment / Effective Power"
        end={<Icon>speed</Icon>}>
        {C}
      </ListItem>
      <Typography.Label.Small tag="div" style={{ padding: "0px 16px 8px", opacity: 0.5 }}>* Rough estimate for reference only. Only valid when no wind and clutch fully engaged. </Typography.Label.Small>
    </Card>
  </div>;
}

type Data = {
  deltaTime: number,
  acceleration: number,
  kineticEnergyIncrement: number,
  heightChange: number,
  tireTempChange: number[],
  angularVelocity: number[],
  powerDiff: number,
  ratio: number;
  data: MessageData;
};

function getDate(messageData: CircularBuffer<MessageData>, messageDataAnalysis: MessageDataAnalysis) {
  if (messageData.getElementCount() < 2) {
    return [];
  }
  const data = [...messageData];
  const powerDiff = [...messageDataAnalysis.powerDiff];
  const res = new Array<Data>(data.length - 1);
  for (let i = 0; i < data.length - 1; i++) {
    const a = data[i];
    const b = data[i + 1];
    const acceleration = b.speed - a.speed;
    const kineticEnergyIncrement = (b.speed + a.speed) * acceleration;
    const heightChange = b.positionY - a.positionY;
    const deltaTime = b.timestampMs - a.timestampMs;
    const tireTempChange = [
      b.tireTempFrontLeft - a.tireTempFrontLeft + b.tireTempFrontRight - a.tireTempFrontRight,
      b.tireTempRearLeft - a.tireTempRearLeft + b.tireTempRearRight - a.tireTempRearRight];
    const angularVelocity = [
      Math.pow(b.angularVelocityX, 2) - Math.pow(a.angularVelocityX, 2),
      Math.pow(b.angularVelocityY, 2) - Math.pow(a.angularVelocityY, 2),
      Math.pow(b.angularVelocityZ, 2) - Math.pow(a.angularVelocityZ, 2)];
    res[i] = {
      deltaTime,
      acceleration,
      kineticEnergyIncrement,
      heightChange,
      tireTempChange,
      powerDiff: powerDiff[i + 1],
      angularVelocity,
      ratio: (kineticEnergyIncrement < 0 || b.power <= 0 || a.power <= 0) ? 0 :
        (kineticEnergyIncrement / (b.power + a.power)),
      data: b,
    };
  }
  return res;
}

// Draw conclusions:
//
// d(v)                                            ~ d(v) is differential of v
// kinetic energy = 1/2 * m * v^2                  ~ v mean speed
// d(kinetic energy) = P * d(t)                    ~ P mean effective power
// 1/2 * m * (v1^2 - v0^2) = P * d(t)
// (v1^2 - v0^2) / (P * d(t)) = 2  / m = C         ~ C is some const, assume m is const
// P = P(engine) - P(wind) - P(gravity) - P(other) 
// P(wind) = F(wind) * v
// F(wind) = K * v^2                               ~ K is some const, is wind resistance factor
// P(wind) = K * v^3
// P(gravity) = v(vertical) * F(gravity)
// P(gravity) = heightChange * F(gravity) / d(t)   ~ assume F(gravity) is const
// P(gravity) = heightChange * H / d(t)            ~ H is some const
// 
// (v1^2 - v0^2) / ((P(engine) - K * v^3 - H * heightChange - P(other)) * d(t)) = C 
// (v1^2 - v0^2) / d(t) = C * P(engine) - C * K * v^3 - C * H * heightChange / d(t) - C * P(other)
//
// similar:
// y = C * x0 + (C * K) * x1 + (C * H) * x2 + (C * T) * x3 + O
//
// linear regression

function getWindResistance(data: Data[]) {
  const d = data.filter(v =>
    v.ratio !== 0 &&
    v.deltaTime > 0 &&
    isValidPowerDiff(v.powerDiff) &&
    v.data.brake === 0 &&
    v.data.clutch === 0 &&
    v.data.handbrake === 0);
  const y = d.map(v => [v.kineticEnergyIncrement / v.deltaTime]);
  const x = d.map(v => [
    v.data.power, -Math.pow(v.data.speed, 3),
    v.heightChange / v.deltaTime,
    ...v.tireTempChange,
    ...v.angularVelocity.map(value => value / v.deltaTime),
    1]);// @TODO: Provide more linear correlation parameters that improve the accuracy of prediction results.
  try {
    const b = linearRegression(x, y);
    const C = b.get(0, 0);
    const K = b.get(1, 0) / C;
    return { K, C };
  } catch (error) {
    console.error(error);
    const C = Number.NaN;
    const K = Number.NaN;
    return { K, C };
  }
}

// reference: https://en.wikipedia.org/wiki/Linear_regression
// Least-squares estimation and related techniques
function linearRegression(x: number[][], y: number[][]) {
  // y[0].length === 1
  // x.length === y.length
  const X = new Matrix(x);
  const Y = new Matrix(y);
  const XT = X.transpose();
  const XT_X = XT.mmul(X);
  const XT_Y = XT.mmul(Y);
  const Beta = inverse(XT_X).mmul(XT_Y);
  return Beta;
}
