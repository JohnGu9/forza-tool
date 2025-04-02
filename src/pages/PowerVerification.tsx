import { SharedAxis } from "material-design-transform";
import React from "react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Ripple } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { MessageDataAnalysis } from "../common/MessageDataAnalysis";
import { getPowerUnit, UnitSystem, wTo } from "../common/UnitConvert";
import { PowerVerificationOption, ReactWindowContext } from "./common/Context";

export default function PowerVerification() {
  const { padding, powerVerificationOption, setPowerVerificationOption } = React.useContext(ReactWindowContext);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const { unitSystem } = React.useContext(ReactAppContext);
  const { power } = getTargetData(messageData, unitSystem);

  function getNextOption(powerVerificationOption: PowerVerificationOption) {
    switch (powerVerificationOption) {
      case PowerVerificationOption.Diff:
        return PowerVerificationOption.Ratio;
      case PowerVerificationOption.Ratio:
        return PowerVerificationOption.Diff;
    }
  }

  return <SharedAxis keyId={powerVerificationOption} className="fill-parent" style={{ padding, gap: 16 }}>
    <Card className="fill-parent">
      <Ripple className="fill-parent fit-elevated-card-container-shape" style={{ padding: "8px 16px" }}
        onClick={() => setPowerVerificationOption(getNextOption(powerVerificationOption))}>
        <ResponsiveContainer width="100%" height="100%">
          {getChart(powerVerificationOption, power, messageDataAnalysis, unitSystem)}
        </ResponsiveContainer>
      </Ripple>
    </Card>
  </SharedAxis>;
}

function getTargetData(messageData: CircularBuffer<MessageData>, unitSystem: UnitSystem) {
  const power = messageData.map((data, index) => {
    return { index, ["Power"]: wTo(data.power, unitSystem), ["Torque * RPM"]: - wTo(1000 * data.torque * data.currentEngineRpm / 9550, unitSystem) };
  });
  return { power };
}

function getChart(powerVerificationOption: PowerVerificationOption,
  power: { index: number; Power: number; "Torque * RPM": number; }[],
  messageDataAnalysis: MessageDataAnalysis,
  unitSystem: UnitSystem,
) {
  function mapDiffData() {
    return power.map(value => {
      return { index: value.index, ["Power / (Torque * RPM)"]: -value.Power / value["Torque * RPM"] };
    });
  }
  switch (powerVerificationOption) {
    case PowerVerificationOption.Diff:
      return <BarChart data={mapDiffData()} margin={{ top: 16, right: 0, left: 8 }}>
        <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
        <YAxis domain={['dataMin', 'dataMax']} ticks={[0.99, 0.998, 1, 1.002, 1.01]}
          tickFormatter={(value) => {
            return `${(value as number) * 100} %`;
          }} />
        <Tooltip contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }}
          formatter={(value) => {
            return `${((value as number) * 100).toFixed(3)} %`;
          }} />
        <CartesianGrid strokeDasharray="3 3" />
        <Legend />
        <Bar type="monotone" dataKey="Power / (Torque * RPM)" fill="var(--md-sys-color-tertiary)" isAnimationActive={false} >
          {messageDataAnalysis.powerDiff.map((value, index) => {
            const color = (value > 0.998 && value < 1.002) ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-error)";
            return <Cell key={index} fill={color} />;
          })}
        </Bar>
      </BarChart>;
    case PowerVerificationOption.Ratio:
      return <ComposedChart data={power} margin={{ top: 16, right: 0, left: -56 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
        <YAxis domain={([min, max]) => {
          const absMax = Math.max(Math.abs(min), Math.abs(max)) * 1.05;
          return [-absMax, absMax];
        }} tick={false} />
        <Tooltip contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }}
          formatter={(value, name, _, __, payload) => {
            switch (name) {
              case "Power": {
                const predict = payload.find(v => v.name === "Torque * RPM");
                if (predict) {
                  return `${(value as number).toFixed(3)} ${getPowerUnit(unitSystem)} (${((value as number) + (predict.value as number)).toFixed(3)} ${getPowerUnit(unitSystem)} -> ${(-(value as number) / (predict.value as number) * 100).toFixed(3)}%)`;
                } else {
                  return `${(value as number).toFixed(3)} ${getPowerUnit(unitSystem)}`;
                }
              }
              default: // Torque * RPM
                return `${(-(value as number)).toFixed(3)} ${getPowerUnit(unitSystem)}`;
            }
          }} />
        <Legend />
        <Area type="monotone" dataKey="Torque * RPM" stroke="var(--md-sys-color-primary)" fillOpacity={0.2} fill="var(--md-sys-color-primary)" isAnimationActive={false} />
        <Bar type="monotone" dataKey="Power" fill="var(--md-sys-color-tertiary)" isAnimationActive={false} >
          {messageDataAnalysis.powerDiff.map((value, index) => {
            const color = (value > 0.998 && value < 1.002) ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-error)";
            return <Cell key={index} fill={color} />;
          })}
        </Bar>
      </ComposedChart>;
  }
}

