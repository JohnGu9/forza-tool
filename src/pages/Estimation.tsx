import "./Estimation.scss";

import React from "react";
import { Card, CircularProgress, Icon, ListItem, Typography } from "rmcw/dist/components3";

import { ReactStreamAppContext } from "../common/AppContext";
import { dummyMessageData, MessageData } from "../common/MessageData";
import { ConsumptionEstimation } from "../common/MessageDataAnalysis";
import { ReactWindowContext, TimeCalibration } from "./common/Context";

export default function Estimation() {
  const { padding, timeCalibration, setTimeCalibration } = React.useContext(ReactWindowContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const lastData = messageData.getLast() ?? dummyMessageData;
  const perLapConsumption = messageDataAnalysis.consumptionEstimation.getPerLapConsumption();
  const unitTimeConsumption = messageDataAnalysis.consumptionEstimation.getUnitTimeConsumption();
  const lapsEstimation = messageDataAnalysis.consumptionEstimation.estimateLaps();
  const remainEstimation = ConsumptionEstimation.estimateRemainLaps(perLapConsumption, lastData);
  const tireWearStats = getTireWearStats(lastData);
  function getCircularProgressClassName(name: string) {
    if (tireWearStats.max[1] === 0) {
      return "estimation-circular-progress";
    }
    if (tireWearStats.max[0] === name) {
      return "estimation-circular-progress max";
    }
    if (tireWearStats.min[0] === name) {
      return "estimation-circular-progress min";
    }
    return "estimation-circular-progress";
  }
  // @TODO: FM8 lap time unit seem to have changed that "Per 10/20 Minute" estimation is incorrect for now
  return <div className="fill-parent" style={{ padding, overflowY: "auto" }}>
    <Card className="flex-column" style={{ width: "100%" }}>
      <ListItem
        className="fill-parent fit-elevated-card-container-shape"
        type="button"
        start={<Icon>schedule</Icon>}
        trailingSupportingText={<span title={toPercentage(lastData.fuel)}>X {timeCalibration.toFixed(1)}</span>}
        onClick={() => {
          function getNext(timeCalibration: TimeCalibration) {
            switch (timeCalibration) {
              case TimeCalibration.X1: return TimeCalibration.X10;
              case TimeCalibration.X10: return TimeCalibration.X100;
              case TimeCalibration.X100: return TimeCalibration.X1000;
              case TimeCalibration.X1000: return TimeCalibration.X10000;
              case TimeCalibration.X10000: return TimeCalibration.X1;
            }
          }
          setTimeCalibration(getNext(timeCalibration));
        }}>
        Time Calibration
      </ListItem>
    </Card>
    <div style={{ height: 16 }} aria-hidden />
    <Card className="flex-column" style={{ width: "100%" }}>
      <ListItem
        start={<Icon>tire_repair</Icon>}
        trailingSupportingText={<div className="flex-row" style={{ gap: 8, alignItems: "center" }}>
          <span title={`FrontLeft: ${toPercentage(lastData.tireWearFrontLeft)}`}><CircularProgress className={getCircularProgressClassName("tireWearFrontLeft")} value={1 - lastData.tireWearFrontLeft} /></span>
          <span title={`FrontRight: ${toPercentage(lastData.tireWearFrontRight)}`}><CircularProgress className={getCircularProgressClassName("tireWearFrontRight")} value={1 - lastData.tireWearFrontRight} /></span>
          |
          <span title={`RearLeft: ${toPercentage(lastData.tireWearRearLeft)}`}><CircularProgress className={getCircularProgressClassName("tireWearRearLeft")} value={1 - lastData.tireWearRearLeft} /></span>
          <span title={`RearRight: ${toPercentage(lastData.tireWearRearRight)}`}><CircularProgress className={getCircularProgressClassName("tireWearRearRight")} value={1 - lastData.tireWearRearRight} /></span>
        </div>}
        supportingText={<span title="Max"><span>{toPercentage(tireWearStats.max[1])}</span> / <span title="Min">{toPercentage(tireWearStats.min[1])}</span></span>}>Tire Wear</ListItem>
      <Item trailingSupportingText={toPercentage(perLapConsumption.tireWear)} emphasize>Per Lap</Item>
      <Item trailingSupportingText={`${toPercentage(unitTimeConsumption.tireWear * 600 * timeCalibration)} / ${toPercentage(unitTimeConsumption.tireWear * 1200 * timeCalibration)}`} emphasize>Per 10/20 Minute</Item>
      <Item trailingSupportingText={(lapsEstimation.tireWear * 0.5).toFixed(1)}>Laps of 50% Tire Wear</Item>
      <Item trailingSupportingText={(lapsEstimation.tireWear * 0.65).toFixed(1)}>Laps of 65% Tire Wear</Item>
      <Item trailingSupportingText={(remainEstimation.tireWear50).toFixed(1)} emphasize>Laps of Until 50% Tire Wear</Item>
      <Item trailingSupportingText={(remainEstimation.tireWear65).toFixed(1)} emphasize>Laps of Until 65% Tire Wear</Item>
      <Typography.Label.Small tag="div" style={{ padding: "8px 16px", opacity: 0.5 }}>* Only work for Forza Motorsport</Typography.Label.Small>
    </Card>
    <div style={{ height: 16 }} aria-hidden />
    <Card className="flex-column" style={{ width: "100%" }}>
      <ListItem
        start={<Icon>local_gas_station</Icon>}
        trailingSupportingText={<span title={toPercentage(lastData.fuel)}><CircularProgress className="estimation-circular-progress" value={lastData.fuel} /></span>}
        supportingText={toPercentage(lastData.fuel)}>Fuel</ListItem>
      <Item trailingSupportingText={toPercentage(perLapConsumption.fuel)} emphasize>Per Lap</Item>
      <Item trailingSupportingText={`${toPercentage(unitTimeConsumption.fuel * 600 * timeCalibration)} / ${toPercentage(unitTimeConsumption.fuel * 1200 * timeCalibration)}`} emphasize>Per 10/20 Minute</Item>
      <Item trailingSupportingText={(lapsEstimation.fuel).toFixed(1)}>Laps of Full Fuel</Item>
      <Item trailingSupportingText={(remainEstimation.fuel).toFixed(1)} emphasize>Laps of Remain Fuel</Item>
      <Typography.Label.Small tag="div" style={{ padding: "8px 16px", opacity: 0.5 }}>* Only work for Dash</Typography.Label.Small>
    </Card>
  </div>;
}

function Item({ trailingSupportingText, emphasize, children }: { trailingSupportingText: React.ReactNode; children?: React.ReactNode; emphasize?: boolean; }) {
  return <ListItem trailingSupportingText={<Typography.Title.Medium tag="span">{trailingSupportingText}</Typography.Title.Medium>}
    style={{ backgroundColor: emphasize ? "var(--md-sys-color-background)" : undefined }}>{children}</ListItem>;
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
  return { max, min };
}
