import { SharedAxis } from "material-design-transform";
import React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { Card, Ripple } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { getPowerUnit, UnitSystem, wTo } from "../common/UnitConvert";
import { PowerVerificationOption, ReactWindowContext } from "./common/Context";

export default function PowerVerification() {
  const { padding, powerVerificationOption, setPowerVerificationOption } = React.useContext(ReactWindowContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { unitSystem } = React.useContext(ReactAppContext);
  const { power, diffPower, diff } = getTargetData(messageData, unitSystem);

  return <div className="fill-parent flex-column flex-space-between" style={{ alignItems: "stretch", padding, gap: 16 }}>
    <Card className="flex-child" style={{ flex: "2 2", padding: "8px 16px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={power} margin={{ top: 16, right: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="Power" />
          <YAxis dataKey="Torque * RPM" />
          <Tooltip contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }}
            formatter={(value) => { return `${(value as number).toFixed(3)} ${getPowerUnit(unitSystem)}`; }} />
          <Legend />
          <Area type="monotone" dataKey="Torque * RPM" stroke="var(--md-sys-color-primary)" fillOpacity={0.2} fill="var(--md-sys-color-primary)" isAnimationActive={false} />
          <Area type="monotone" dataKey="Power" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
    <SharedAxis className="flex-child" keyId={powerVerificationOption}>
      {(() => {
        switch (powerVerificationOption) {
          case PowerVerificationOption.Diff:
            return <SimpleCard title="Power - (Torque * RPM)" data={diffPower} onClick={() => setPowerVerificationOption(PowerVerificationOption.Ratio)} />;
          case PowerVerificationOption.Ratio:
            return <SimpleCard title="Power / (Torque * RPM)" data={diff} onClick={() => setPowerVerificationOption(PowerVerificationOption.Diff)}
              ticks={[1]}
              domain={([min, max]) => {
                return [Math.min(0.97, min - 0.01), Math.max(1.03, max + 0.01)];
              }}
              formatter={value => `${(value * 100).toFixed(3)} %`} />;
        }
      })()}
    </SharedAxis>

  </div>;
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, unitSystem: UnitSystem) {
  const length = messageData.getElementCount();
  const power = new Array<{ index: number, ["Power"]: number, ["Torque * RPM"]: number; }>(length);
  const diffPower = new Array<DataType>(length);
  const diff = new Array<DataType>(length);
  let index = 0;
  for (const data of messageData) {
    power[index] = { index, ["Power"]: wTo(data.power, unitSystem), ["Torque * RPM"]: wTo(1000 * data.torque * data.currentEngineRpm / 9550, unitSystem) };
    diffPower[index] = { index, value: power[index]["Power"] - power[index]["Torque * RPM"] };
    diff[index] = { index, value: power[index]["Power"] / power[index]["Torque * RPM"] };
    index++;
  }
  return { power, diffPower, diff };
}

function SimpleCard({ title, data, domain, ticks, formatter, onClick }: {
  title: string, data: DataType[], domain?: AxisDomain, ticks?: (string | number)[],
  formatter?: ((value: number) => string),
  onClick: () => unknown,
}) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const { messageDataAnalysis } = React.useContext(ReactStreamAppContext);

  const value = data.length === 0 ? 0 : data[data.length - 1].value;
  function defaultFormatter(value: number) {
    return `${value.toFixed(3)} ${getPowerUnit(unitSystem)}`;
  }
  formatter ??= defaultFormatter;
  return <Card className="fill-parent">
    <Ripple className="fill-parent flex-column fit-elevated-card-container-shape" style={{ alignItems: "stretch", padding: "8px 16px" }}
      onClick={onClick}>
      <div className="flex-child" style={{ overflow: "clip" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -42, bottom: -16 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" type="number" tick={false} domain={['dataMin', 'dataMax']} />
            <YAxis dataKey="value" domain={domain} ticks={ticks ?? [0]} />
            <Tooltip formatter={(value) => { return formatter(value as number); }}
              contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
            <Bar type="monotone" dataKey="value" fill="var(--md-sys-color-tertiary)" isAnimationActive={false} >
              {messageDataAnalysis.powerDiff.map((value, index) => {
                const color = (value > 0.998 && value < 1.002) ? "var(--md-sys-color-tertiary)" : "var(--md-sys-color-error)";
                return <Cell key={index} stroke={color} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-row flex-space-between">
        <span>{title}</span>{formatter(value)}
      </div>
    </Ripple>
  </Card>;
}
