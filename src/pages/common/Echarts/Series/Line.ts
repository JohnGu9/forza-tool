import { Property } from "csstype";

import { AreaStyle } from "../AreaStyle";
import { AxisTooltip } from "../Axis";
import { Focusable, HasSymbol, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { LineStyle } from "../LineStyle";
import { BasicSeries, Cartesian2dCoordinateSystem, Interactive, Label, LabelLayout, LabelLine, Markable, PolarCoordinateSystem, SeriesLayoutBy, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | PolarCoordinateSystem;

export type Line = BasicSeries & CoordinateSystem & HasSymbol & Markable & Interactive<ChangeableStyle, Emphasis> & {
    type: "line";
    showSymbol: boolean;
    showAllSymbol: boolean | "auto";
    stack: string;
    stackStrategy: "samesign" | "all" | "positive" | "negative";
    cursor: Property.Cursor;
    connectNulls: boolean;
    clip: boolean;
    triggerLineEvent: boolean;
    step: boolean | "start" | "middle" | "end";
    label: Partial<Label & { minMargin: number; }>;
    endLabel: Partial<Label & { minMargin: number; valueAnimation: boolean; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    lineStyle: Partial<LineStyle>;
    areaStyle: Partial<AreaStyle & { origin: "auto" | "start" | "end" | number; }>;
    smooth: boolean | number;
    smoothMonotone: "x" | "y";
    sampling: "lttb" | "average" | "min" | "max" | "minmax" | "sum";
    dimensions: Dimension[];
    encode: unknown;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
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
    endLabel: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
    areaStyle: Partial<AreaStyle>;
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
    label: Partial<Label>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    itemStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<{ disabled: boolean; label: Partial<Label>; itemStyle: Partial<SymbolIconStyle>; }>;
    blur: Partial<{ label: Partial<Label>; itemStyle: Partial<SymbolIconStyle>; }>;
    select: Partial<{ disabled: boolean; label: Partial<Label>; itemStyle: Partial<SymbolIconStyle>; }>;
    tooltip: Partial<AxisTooltip>;
};

