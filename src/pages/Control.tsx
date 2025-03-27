import { SharedAxis } from "material-design-transform";
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, LinearProgress, Ripple } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { getPowerUnit, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";

export default function Control() {
  const { padding } = React.useContext(ReactWindowContext);
  const { unitSystem } = React.useContext(ReactAppContext);
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { clutch, accelerator, brake, handbrake, engineBraking } = getTargetData(messageData, unitSystem);
  const [showEngineBraking, setShowEngineBraking] = React.useState(false);
  const switchCard = React.useCallback(() => setShowEngineBraking(v => !v), []);
  return <div className="fill-parent flex-column" style={{ padding, gap: 16 }}>
    <SimpleCard title="Accelerator" data={accelerator} onClick={switchCard} />
    <SimpleCard title="Brake" data={brake} onClick={switchCard} />
    <SharedAxis keyId={showEngineBraking ? 1 : 0}
      className="flex-child flex-row" style={{ flex: "3 3", gap: 16 }} onClick={() => setShowEngineBraking(!showEngineBraking)}>
      {showEngineBraking ?
        <EngineBraking data={engineBraking} /> : <>
          <SimpleCard title="Clutch" data={clutch} onClick={switchCard} />
          <SimpleCard title="Handbrake" data={handbrake} onClick={switchCard} />
        </>}
    </SharedAxis>
  </div>;
}

type DataType = { index: number; value: number; };

function getTargetData(messageData: CircularBuffer<MessageData>, unitSystem: UnitSystem) {
  let index = 0;
  const length = messageData.getElementCount();
  const clutch = new Array<DataType>(length);
  const accelerator = new Array<DataType>(length);
  const brake = new Array<DataType>(length);
  const handbrake = new Array<DataType>(length);
  const engineBraking = new Array<DataType>(length);
  for (const data of messageData) {
    clutch[index] = { index, value: data.clutch / 255 * 100 };
    accelerator[index] = { index, value: data.accelerator / 255 * 100 };
    brake[index] = { index, value: data.brake / 255 * 100 };
    handbrake[index] = { index, value: data.handbrake / 255 * 100 };
    engineBraking[index] = { index, value: wTo(Math.min(data.power, 0), unitSystem) };
    index += 1;
  }
  return { clutch, accelerator, brake, handbrake, engineBraking };
}

function SimpleCard({ title, data, onClick }: { title: string, data: DataType[]; onClick: () => unknown; }) {
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1].value);
  return <Card className="flex-child" style={{ flex: "2 2" }}>
    <Ripple className="fill-parent flex-column flex-space-evenly fit-elevated-card-container-shape" style={{ alignItems: "stretch", padding: 16 }} onClick={onClick}>
      <div className="flex-child" style={{ overflow: "clip" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} tick={false} />
            <YAxis domain={[0, 50, 100]} ticks={[0, 100]} />
            <Tooltip formatter={(value) => { return `${(value as number).toFixed(1)}%`; }}
              contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
            <Area type="monotone" dataKey="value" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
        <span>{title}</span>{(value).toFixed(1)}%
      </div>
      <LinearProgress className="disable-progress-transition" value={value / 100} />
    </Ripple>
  </Card>;
}

function EngineBraking({ data }: { data: DataType[]; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const value = data.length === 0 ? 0 : data[data.length - 1].value;
  return <Card className="flex-child flex-column flex-space-evenly" style={{ flex: "3 3", alignItems: "stretch", padding: 16 }}>
    <div className="flex-child" style={{ overflow: "clip" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}
          margin={{ top: 5, right: 0, left: -20, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" type="number" domain={['dataMin', 'dataMax']} tick={false} />
          <YAxis domain={([min]) => { return [min * 1.05, 0]; }} tick={false} />
          <Tooltip formatter={(value) => { return `${(value as number).toFixed(1)} ${getPowerUnit(unitSystem)}`; }}
            contentStyle={{ backgroundColor: "var(--md-sys-color-surface)" }} />
          <Area type="monotone" dataKey="value" stroke="var(--md-sys-color-tertiary)" fillOpacity={0.6} fill="var(--md-sys-color-tertiary)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
      <span>Engine Braking</span>
      <span>{(value).toFixed(1)} {getPowerUnit(unitSystem)}</span>
    </div>
  </Card>;
}
