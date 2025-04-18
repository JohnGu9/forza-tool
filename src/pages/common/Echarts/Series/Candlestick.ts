import { AxisTooltip } from "../Axis";
import { Orient, Shadow } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, Cartesian2dCoordinateSystem, Interactive, LargeScaleOptimization, Markable, Progressive, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem;

export type Candlestick = BasicSeries & CoordinateSystem & Interactive<ChangeableStyle> & LargeScaleOptimization & Markable & Progressive & {
    type: "candlestick";
    layout: Orient;
    barWidth: string | number;
    barMinWidth: string | number;
    barMaxWidth: string | number;
    itemStyle: Partial<ItemStyle>;
    dimensions: Dimension[];
    encode: unknown;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type ChangeableStyle = {
    itemStyle: Partial<ItemStyle>;
};

type ItemStyle = Shadow & {
    color: string;
    color0: string;
    borderColor: string;
    borderColor0: string;
    borderColorDoji: string;
    borderWidth: number;
    opacity: number;
};

type Data = Omit<Interactive<ChangeableStyle>, "selectedMode"> & {
    name: string;
    value: [number, number, number, number];
    groupId: string;
    childGroupId: string;
    itemStyle: Partial<ItemStyle>;
    tooltip: Partial<AxisTooltip>;
};
