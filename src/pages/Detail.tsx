import React from "react";
import { ListItem, Select, SelectOption, Switch } from "rmcw/dist/components3";

import { ReactStreamAppContext } from "../common/AppContext";
import capitalizeFirstLetter from "../common/CapitalizeFirstLetter";
import CircularBuffer from "../common/CircularBuffer";
import { DataType, dummyMessageData, getValidKeys, MessageData, MessageDataKey } from "../common/MessageData";
import { ReactWindowContext } from "./common/Context";
import { useEcharts } from "./common/Echarts";

export default function Detail() {
  const { messageData } = React.useContext(ReactStreamAppContext);
  const { padding, detailOption, setDetailOption, showDetailDelta, setShowDetailDelta } = React.useContext(ReactWindowContext);
  const data = showDetailDelta ?
    getDelta(messageData, detailOption as MessageDataKey) :
    messageData.map((data, index) => { return { index, value: data[detailOption as MessageDataKey] }; });
  const lastData = messageData.getLast();
  const currentDataType = lastData ? getDataTypeName(lastData.dataType) : "Unknown Data Type";
  const validKeys = getValidKeys(lastData?.dataType);
  const displayText = React.useMemo(() => capitalizeFirstLetter(detailOption), [detailOption]);
  const ref = useEcharts<HTMLDivElement>({
    grid: {
      left: 32,
      top: 32,
      right: 0,
      bottom: 32
    },
    tooltip: {
      trigger: "axis",
    },
    series: [
      {
        type: "line",
        data: data.map(v => [v.index, v.value]),
        symbolSize: 0,
      }
    ]
  });
  return <div className="fill-parent flex-column">
    <div className="flex-child flex-column" style={{ padding }}>
      <Select label={currentDataType} displayText={displayText}>
        {keys.map(key => <SelectOption key={key} headline={key} disabled={!validKeys.has(key)} selected={detailOption === key} onClick={() => setDetailOption(key)} style={{ textTransform: "capitalize" }} />)}
      </Select>
      <div style={{ height: 16 }} aria-hidden />
      <div ref={ref} className="flex-child" style={{ width: "100%", overflow: "clip" }} />
    </div>
    <ListItem type="button" end={<Switch selected={showDetailDelta} />} onClick={() => setShowDetailDelta(!showDetailDelta)}>Show Delta</ListItem>
    <div style={{ height: 8 }} aria-hidden />
  </div>;
}

function getDataTypeName(dataType: DataType) {
  switch (dataType) {
    case DataType.Sled:
      return "Frza Sled";
    case DataType.FH4Dash:
      return "Forza Horizon Dash";
    case DataType.FM7Dash:
      return "Forza Motorsport 7 Dash";
    case DataType.FM8Dash:
      return "Forza Motorsport Dash";
  }
}

function getDelta<T extends MessageDataKey>(messageData: CircularBuffer<MessageData>, option: T) {
  const lower = messageData.getLowerBound();
  const upper = messageData.getUpperBound();
  if ((upper - lower) < 2) {
    return [];
  }
  const res = new Array<{ index: number, value: number; }>(upper - lower - 1);
  for (let index = lower, i = 0; index < (upper - 1); index++, i++) {
    const data0 = messageData.getUnsafe(index);
    const data1 = messageData.getUnsafe(index + 1);
    const value0 = data0[option] as number;
    const value1 = data1[option] as number;
    res[i] = { index: i, value: (value1 - value0) };
  }
  return res;
}

const keys = Object.keys(dummyMessageData).filter(value => {
  switch (value) {
    case "dataType":
    case "isRaceOn":
      return false;
    default:
      return true;
  }
}) as MessageDataKey[];
