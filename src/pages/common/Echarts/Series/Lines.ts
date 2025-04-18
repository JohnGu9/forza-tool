import { AxisTooltip } from "../Axis";
import { HasSymbol } from "../common";
import { LineStyle } from "../LineStyle";
import { BasicSeries, Cartesian2dCoordinateSystem, GeoCoordinateSystem, Interactive, Label, LabelLayout, LargeScaleOptimization, Markable, Progressive, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | GeoCoordinateSystem;

export type Lines = BasicSeries & CoordinateSystem & LargeScaleOptimization & HasSymbol & Interactive<ChangeableStyle> & Progressive & Markable & {
    type: "lines";
    polyline: boolean;
    effect: Partial<Effect>;
    lineStyle: Partial<LineStyle & { curveness: number; }>;
    label: Partial<Label & { minMargin: number; }>;
    labelLayout: Partial<LabelLayout>;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type Effect = HasSymbol & {
    show: boolean;
    period: number;
    delay: number | (() => number);
    constantSpeed: number;
    color: string;
    trailLength: number;
    loop: boolean;
    roundTrip: boolean;
};

type ChangeableStyle = {
    label: Partial<Label>;
    lineStyle: Partial<LineStyle>;
};

type Data = Omit<Interactive<ChangeableStyle>, "selectedMode"> & {
    name: string;
    groupId: string;
    childGroupId: string;
    coords: [number, number];
    lineStyle: Partial<LineStyle & { curveness: number; }>;
    label: Partial<Label & { minMargin: number; }>;
    tooltip: Partial<AxisTooltip>;
};
