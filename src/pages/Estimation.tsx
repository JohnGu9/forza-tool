import "./Estimation.scss";

import React from "react";
import { Card, CircularProgress, ListItem, Typography } from "rmcw/dist/components3";

import { ReactStreamAppContext } from "../common/AppContext";

export default function Estimation() {
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastData = messageData.getLast();
  return <div className="fill-parent" style={{ padding: 16, overflowY: "scroll" }}>
    <Card className="flex-column" style={{ padding: "12px 0 0", width: "100%" }}>
      <Typography.Title.Large tag="div" className="flex-row flex-space-between" style={{ padding: "0 16px 8px" }}>
        Tire Wear
        <div className="flex-row" style={{ gap: 8 }}>
          <span title={`FrontLeft: ${toPercentage(lastData?.tireWearFrontLeft ?? 0)}`}><CircularProgress className="estimation-circular-progress" value={lastData?.tireWearFrontLeft ?? 1} /></span>
          <span title={`FrontRight: ${toPercentage(lastData?.tireWearFrontRight ?? 0)}`}><CircularProgress className="estimation-circular-progress" value={lastData?.tireWearFrontRight ?? 1} /></span>
          <span title={`RearLeft: ${toPercentage(lastData?.tireWearRearLeft ?? 0)}`}><CircularProgress className="estimation-circular-progress" value={lastData?.tireWearRearLeft ?? 1} /></span>
          <span title={`RearRight: ${toPercentage(lastData?.tireWearRearRight ?? 0)}`}><CircularProgress className="estimation-circular-progress" value={lastData?.tireWearRearRight ?? 1} /></span>
        </div>
      </Typography.Title.Large>
      <ListItem trailingSupportingText={toPercentage(messageDataAnalysis.consumptionEstimation.tireWearPerLap)}>Per Lap</ListItem>
      <ListItem trailingSupportingText={toPercentage(messageDataAnalysis.consumptionEstimation.tireWearPerTenMin)}>Per 10 Minute</ListItem>
      <ListItem trailingSupportingText={lapsEstimate(messageDataAnalysis.consumptionEstimation.tireWearPerLap, 0.5)}>Laps of 50% Tire Wear</ListItem>
      <ListItem trailingSupportingText={lapsEstimate(messageDataAnalysis.consumptionEstimation.tireWearPerLap, 0.65)}>Laps of 65% Tire Wear</ListItem>
      <ListItem trailingSupportingText={lastData === undefined ? "0.0" : lapsEstimate(messageDataAnalysis.consumptionEstimation.tireWearPerLap,
        Math.max(0, 0.5 - Math.max(lastData.tireWearFrontLeft, lastData.tireWearFrontRight, lastData.tireWearRearLeft, lastData.tireWearRearRight))
      )}>Laps of Until 50% Tire Wear</ListItem>
      <ListItem trailingSupportingText={lastData === undefined ? "0.0" : lapsEstimate(messageDataAnalysis.consumptionEstimation.tireWearPerLap,
        Math.max(0, 0.5 - Math.max(lastData.tireWearFrontLeft, lastData.tireWearFrontRight, lastData.tireWearRearLeft, lastData.tireWearRearRight))
      )}>Laps of Until 65% Tire Wear</ListItem>
      <Typography.Label.Small tag="div" style={{ padding: "8px 16px 16px", opacity: 0.5 }}>* Only work for Forza Motorsport</Typography.Label.Small>
    </Card>
    <div style={{ height: 16 }} aria-hidden />
    <Card className="flex-column" style={{ padding: "12px 0 0", width: "100%" }}>
      <Typography.Title.Large tag="div" className="flex-row flex-space-between" style={{ padding: "0 16px 8px" }}>
        Fuel
        <span title={toPercentage(lastData?.fuel ?? 0)}><CircularProgress className="estimation-circular-progress" value={lastData?.fuel ?? 1} /></span>
      </Typography.Title.Large>
      <ListItem trailingSupportingText={toPercentage(messageDataAnalysis.consumptionEstimation.fuelPerLap)}>Per Lap</ListItem>
      <ListItem trailingSupportingText={toPercentage(messageDataAnalysis.consumptionEstimation.fuelPerTenMin)}>Per 10 Minute</ListItem>
      <ListItem trailingSupportingText={lapsEstimate(messageDataAnalysis.consumptionEstimation.fuelPerLap, 1)}>Laps of Full Fuel</ListItem>
      <ListItem trailingSupportingText={lastData === undefined ? "0" : lapsEstimate(messageDataAnalysis.consumptionEstimation.fuelPerLap, lastData.fuel)}>Laps of Remain Fuel</ListItem>
      <Typography.Label.Small tag="div" style={{ padding: "8px 16px 16px", opacity: 0.5 }}>* Only work for Dash</Typography.Label.Small>
    </Card>
  </div>;
}

function toPercentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function lapsEstimate(consumptionPerLap: number, targetConsumption: number) {
  if (consumptionPerLap === 0) return "0.0";
  return `${(targetConsumption / consumptionPerLap).toFixed(1)}`;
}
