import { SharedAxis } from "material-design-transform";
import React from "react";
import { Card, LinearProgress, Ripple } from "rmcw/dist/components3";

import { ReactAppContext, ReactStreamAppContext } from "../common/AppContext";
import CircularBuffer from "../common/CircularBuffer";
import { MessageData } from "../common/MessageData";
import { getPowerUnit, UnitSystem, wTo } from "../common/UnitConvert";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

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

type DataType = [number, number];

function getTargetData(messageData: CircularBuffer<MessageData>, unitSystem: UnitSystem) {
  let index = 0;
  const length = messageData.getElementCount();
  const clutch = new Array<DataType>(length);
  const accelerator = new Array<DataType>(length);
  const brake = new Array<DataType>(length);
  const handbrake = new Array<DataType>(length);
  const engineBraking = new Array<DataType>(length);
  for (const data of messageData) {
    clutch[index] = [index, data.clutch / 255 * 100];
    accelerator[index] = [index, data.accelerator / 255 * 100];
    brake[index] = [index, data.brake / 255 * 100];
    handbrake[index] = [index, data.handbrake / 255 * 100];
    engineBraking[index] = [index, wTo(Math.min(data.power, 0), unitSystem)];
    index += 1;
  }
  return { clutch, accelerator, brake, handbrake, engineBraking };
}

function SimpleCard({ title, data, onClick }: { title: string, data: DataType[]; onClick: () => unknown; }) {
  const value = data.length === 0 ? 0 : Math.abs(data[data.length - 1][1]);
  const ref = useEcharts<HTMLDivElement>({
    grid: {
      left: 32,
      top: 8,
      right: 0,
      bottom: 8
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      valueFormatter: (value) => {
        return `${(value as number).toFixed(1)}%`;
      },
    },
    series: [
      {
        data: data,
        type: 'line',
        areaStyle: {
          opacity: 0.6,
        },
        showAllSymbol: true,
        symbolSize: 0,
      }
    ]
  });
  return <Card className="flex-child" style={{ flex: "2 2" }}>
    <Ripple className="fill-parent flex-column flex-space-evenly fit-elevated-card-container-shape" style={{ alignItems: "stretch", padding: 16 }} onClick={onClick}>
      <div ref={ref} className="flex-child" style={{ width: "100%", overflow: "clip" }} />
      <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
        <span>{title}</span>{(value).toFixed(1)}%
      </div>
      <LinearProgress className="disable-progress-transition" value={value / 100} />
    </Ripple>
  </Card>;
}

function EngineBraking({ data }: { data: DataType[]; }) {
  const { unitSystem } = React.useContext(ReactAppContext);
  const value = data.length === 0 ? 0 : data[data.length - 1][1];
  const ref = useEcharts<HTMLDivElement>({
    grid: {
      left: 32,
      top: 8,
      right: 0,
      bottom: 8
    },
    yAxis: {
      type: 'value',
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      valueFormatter: (value) => {
        return `${(value as number).toFixed(3)} ${getPowerUnit(unitSystem)}`;
      },
    },
    series: [
      {
        data: data,
        type: 'line',
        areaStyle: {
          opacity: 0.6,
        },
        symbolSize: 0,
      }
    ]
  });
  return <Card className="flex-child flex-column flex-space-evenly" style={{ flex: "3 3", alignItems: "stretch", padding: 16 }}>
    <div ref={ref} className="flex-child" />
    <div className="flex-row flex-space-between" style={{ padding: "4px 0" }}>
      <span>Engine Braking</span>
      <span>{(value).toFixed(1)} {getPowerUnit(unitSystem)}</span>
    </div>
  </Card>;
}
