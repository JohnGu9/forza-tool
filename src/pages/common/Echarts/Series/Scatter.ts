import { Property } from "csstype";

import { AxisTooltip } from "../Axis";
import { Focusable, HasSymbol, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, CalendarCoordinateSystem, Cartesian2dCoordinateSystem, GeoCoordinateSystem, Interactive, Label, LabelLayout, LabelLine, LargeScaleOptimization, Markable, PolarCoordinateSystem, Progressive, SeriesLayoutBy, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | PolarCoordinateSystem | GeoCoordinateSystem | CalendarCoordinateSystem;

export type Scatter = BasicSeries & CoordinateSystem & HasSymbol & LargeScaleOptimization & Markable & Interactive<ChangeableStyle, Emphasis> & Progressive & {
    type: "scatter";
    cursor: Property.Cursor;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    dimensions: Dimension[];
    encode: unknown;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Emphasis = Focusable & {
    disabled: boolean;
    scale: boolean;
};

type Data = HasSymbol & {
    name: string;
    value: unknown;
    groupId: string;
    childGroupId: string;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    itemStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<ChangeableStyle & { disabled: boolean; }>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
    tooltip: Partial<AxisTooltip>;
};
