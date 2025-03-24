import "./Estimation.scss";

import React from "react";
import { Card, CircularProgress, ListItem, Typography } from "rmcw/dist/components3";

import { ReactStreamAppContext } from "../common/AppContext";
import { ConsumptionEstimation, dummyMessageData, MessageData } from "../common/MessageData";

export default function Estimation() {
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastData = messageData.getLast() ?? dummyMessageData;
  const perLapConsumption = messageDataAnalysis.consumptionEstimation.getPerLapConsumption();
  const unitTimeConsumption = messageDataAnalysis.consumptionEstimation.getUnitTimeConsumption();
  const lapsEstimation = messageDataAnalysis.consumptionEstimation.estimateLaps();

  const remainEstimation = ConsumptionEstimation.estimateRemainLaps(perLapConsumption, lastData);
  const tireWearStats = getTireWearStats(lastData);
  function getCircularProgressClassName(name: string) {
    if (tireWearStats.max[1] === 0) {
      return "";
    }
    if (tireWearStats.max[0] === name) {
      return "max";
    }
    if (tireWearStats.min[0] === name) {
      return "min";
    }
    return "";
  }
  return <div className="fill-parent" style={{ padding: 16, overflowY: "auto" }}>
    <Card className="flex-column" style={{ width: "100%" }}>
      <ListItem
        trailingSupportingText={<div className="flex-row" style={{ gap: 8, alignItems: "center" }}>
          <span title={`FrontLeft: ${toPercentage(lastData.tireWearFrontLeft)}`}><CircularProgress className={`estimation-circular-progress ${getCircularProgressClassName("tireWearFrontLeft")}`} value={1 - lastData.tireWearFrontLeft} /></span>
          <span title={`FrontRight: ${toPercentage(lastData.tireWearFrontRight)}`}><CircularProgress className={`estimation-circular-progress ${getCircularProgressClassName("tireWearFrontRight")}`} value={1 - lastData.tireWearFrontRight} /></span>
          <span>|</span>
          <span title={`RearLeft: ${toPercentage(lastData.tireWearRearLeft)}`}><CircularProgress className={`estimation-circular-progress ${getCircularProgressClassName("tireWearRearLeft")}`} value={1 - lastData.tireWearRearLeft} /></span>
          <span title={`RearRight: ${toPercentage(lastData.tireWearRearRight)}`}><CircularProgress className={`estimation-circular-progress ${getCircularProgressClassName("tireWearRearRight")}`} value={1 - lastData.tireWearRearRight} /></span>
        </div>}
        supportingText={<span title="Max"><span>{toPercentage(tireWearStats.max[1])}</span> / <span title="Min">{toPercentage(tireWearStats.min[1])}</span></span>}>Tire Wear</ListItem>
      <ListItem trailingSupportingText={toPercentage(perLapConsumption.tireWear)}>Per Lap</ListItem>
      <ListItem trailingSupportingText={`${toPercentage(unitTimeConsumption.tireWear * 600)} / ${toPercentage(unitTimeConsumption.tireWear * 1200)}`}>Per 10/20 Minute</ListItem>
      <ListItem trailingSupportingText={(lapsEstimation.tireWear * 0.5).toFixed(1)}>Laps of 50% Tire Wear</ListItem>
      <ListItem trailingSupportingText={(lapsEstimation.tireWear * 0.65).toFixed(1)}>Laps of 65% Tire Wear</ListItem>
      <ListItem trailingSupportingText={(remainEstimation.tireWear50).toFixed(1)}>Laps of Until 50% Tire Wear</ListItem>
      <ListItem trailingSupportingText={(remainEstimation.tireWear65).toFixed(1)}>Laps of Until 65% Tire Wear</ListItem>
      <Typography.Label.Small tag="div" style={{ padding: "8px 16px 16px", opacity: 0.5 }}>* Only work for Forza Motorsport</Typography.Label.Small>
    </Card>
    <div style={{ height: 16 }} aria-hidden />
    <Card className="flex-column" style={{ width: "100%" }}>
      <ListItem
        trailingSupportingText={<span title={toPercentage(lastData.fuel)}><CircularProgress className="estimation-circular-progress" value={lastData.fuel} /></span>}
        supportingText={toPercentage(lastData.fuel)}>Fuel</ListItem>
      <ListItem trailingSupportingText={toPercentage(perLapConsumption.fuel)}>Per Lap</ListItem>
      <ListItem trailingSupportingText={`${toPercentage(unitTimeConsumption.fuel * 600)} / ${toPercentage(unitTimeConsumption.fuel * 1200)}`}>Per 10/20 Minute</ListItem>
      <ListItem trailingSupportingText={(lapsEstimation.fuel).toFixed(1)}>Laps of Full Fuel</ListItem>
      <ListItem trailingSupportingText={(remainEstimation.fuel).toFixed(1)}>Laps of Remain Fuel</ListItem>
      <Typography.Label.Small tag="div" style={{ padding: "8px 16px 16px", opacity: 0.5 }}>* Only work for Dash</Typography.Label.Small>
    </Card>
  </div>;
}

function toPercentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function getTireWearStats(data: MessageData) {
  const filter = {
    tireWearFrontLeft: data.tireWearFrontLeft,
    tireWearFrontRight: data.tireWearFrontRight,
    tireWearRearLeft: data.tireWearRearLeft,
    tireWearRearRight: data.tireWearRearRight
  };
  const transform = Object.entries(filter);
  const sorted = transform.sort((a, b) => a[1] - b[1]);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return {
    max, min,
  };
}
