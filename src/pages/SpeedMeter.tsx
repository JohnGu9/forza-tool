import React from "react";
import { Card, Ripple, Typography } from "rmcw/dist/components3";
import useResize from "../hooks/resize";
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { ReactAppContext, ReactStreamAppContext, UnitSystem } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData, MessageDataAnalysis } from "../common/MessageData";

const columnHeight = 150;

export default function SpeedMeter() {
  const ref = React.useRef<HTMLDivElement>(null);
  const size = useResize(ref);
  const { messageData, messageDataAnalysis } = React.useContext(ReactStreamAppContext);
  const { unitSystem, setUnitSystem } = React.useContext(ReactAppContext);
  const changeUnitSystem = React.useCallback(() => {
    switch (unitSystem) {
      case UnitSystem.International:
        return setUnitSystem(UnitSystem.Imperial);
      case UnitSystem.Imperial:
        return setUnitSystem(UnitSystem.International);
    }
  }, [setUnitSystem, unitSystem]);
  const data = toData(messageData, messageDataAnalysis, unitSystem);
  const lastData = data.length === 0 ? { index: 0, speed: 0, velocity: 0 } : data[0];
  return <div className="fill-parent flex-column" style={{ padding: "16px 32px" }}>
    <div className="flex-row" style={{ height: columnHeight, justifyContent: "space-between" }}>
      <SimpleCard title="Speed" content={lastData.speed.toFixed(1)} tooltip={`car speed meter value; unit: ${getSpeedUnit(unitSystem)}`} onClick={changeUnitSystem} />
      <SimpleCard title="Velocity" content={lastData.velocity.toFixed(1)} tooltip={`velocity = (position delta) / (time delta); unit: ${getSpeedUnit(unitSystem)}`} onClick={changeUnitSystem} />
      <SimpleCard title="Delta" content={`${((lastData.velocity / lastData.speed) * 100).toFixed(1)} %`} tooltip="velocity / speed" onClick={changeUnitSystem} />
    </div>
    <div ref={ref} style={{ flexGrow: "1", width: "100%" }}>
      <AreaChart width={size.width} height={size.height} data={data}
        margin={{ top: 16, right: 2, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="index" type="number" hide />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="speed" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
        <Area type="monotone" dataKey="velocity" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
      </AreaChart>
    </div>
  </div>;
}

function SimpleCard({ title, tooltip, content, onClick }: { title: string, tooltip: string, content: string; onClick: () => unknown; }) {
  return <Card style={{ width: 150, height: "100%" }}>
    <Ripple onClick={onClick} className="fill-parent flex-column" style={{ justifyContent: "space-evenly", alignItems: "center", borderRadius: "var(--_container-shape, 12px)" }}>
      <Typography.Headline.Small tag='span' title={tooltip}>{title}</Typography.Headline.Small>
      <Typography.Headline.Large tag='span' title={tooltip}>{content}</Typography.Headline.Large>
    </Ripple>
  </Card>;
}

function toData(messageData: CircularBuffer<MessageData>, messageDataAnalysis: MessageDataAnalysis, unit: UnitSystem) {
  const delta = messageData.getElementCount() - messageDataAnalysis.speed.getElementCount();
  const placeholder = new Array(delta);
  placeholder.fill(0);
  const velocity = [...placeholder, ...messageDataAnalysis.speed];
  return messageData.map((data, index) => {
    return { index, speed: msTo(data.speed, unit), velocity: msTo(velocity[index], unit) };
  });
}

function msTo(value: number/* unit: m/s */, unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.Imperial:
      return value * 2.23694;
    default:
      return value * 3.6;
  }
}

function getSpeedUnit(unit: UnitSystem) {
  switch (unit) {
    case UnitSystem.Imperial:
      return "MPH";
    default:
      return "KMH";
  }
}
