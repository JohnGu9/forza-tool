import { Property } from "csstype";

import { AxisTooltip } from "../Axis";
import { Focusable, HasSymbol, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, CalendarCoordinateSystem, Cartesian2dCoordinateSystem, GeoCoordinateSystem, Interactive, Label, LabelLayout, LabelLine, Markable, PolarCoordinateSystem, SeriesLayoutBy } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | PolarCoordinateSystem | GeoCoordinateSystem | CalendarCoordinateSystem;

export type EffectScatter = BasicSeries & CoordinateSystem & HasSymbol & Markable & Interactive<ChangeableStyle, Emphasis> & {
    type: "effectScatter";
    effectType: "ripple";
    showEffectOn: "render" | "emphasis";
    rippleEffect: Partial<RippleEffect>;
    cursor: Property.Cursor;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dimensions: Dimension[];
    encode: unknown;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    silent: boolean;
};

type RippleEffect = {
    color: string;
    number: number;
    period: number;
    scale: number;
    brushType: "fill" | "stroke";
    coordinateSystem: "cartesian2d" | "polar" | "geo" | "calendar";
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
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    itemStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<ChangeableStyle & { disabled: boolean; }>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
    tooltip: Partial<AxisTooltip>;
};
