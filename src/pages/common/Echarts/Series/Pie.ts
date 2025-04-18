import { Property } from "csstype";

import { AxisTooltip } from "../Axis";
import { Focusable, PolarPosition, Position, Size, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, CalendarCoordinateSystem, GeoCoordinateSystem, Interactive, Label, LabelLayout, LabelLine, Markable, SeriesLayoutBy, UniversalTransition } from "./common";

type CoordinateSystem = GeoCoordinateSystem | CalendarCoordinateSystem;

export type Pie = BasicSeries & CoordinateSystem & Position & Size & PolarPosition & Markable & Interactive<ChangeableStyle, Emphasis> & {
    type: "pie";
    selectedOffset: number;
    clockwise: boolean;
    startAngle: number;
    endAngle: number | "auto";
    minAngle: number;
    padAngle: number;
    minShowLabelAngle: number;
    roseType: boolean | "radius" | "area";
    avoidLabelOverlap: boolean;
    stillShowZeroSum: boolean;
    percentPrecision: number;
    cursor: Property.Cursor;
    showEmptyCircle: boolean;
    emptyCircleStyle: Partial<SymbolIconStyle>;
    label: Partial<Label & LabelExtend>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    dimensions: Dimension[];
    encode: unknown;
    data: (Partial<Data> | unknown)[];
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type LabelExtend = {
    minMargin: number;
    alignTo: "none" | "labelLine" | "edge";
    edgeDistance: string | number;
    bleedMargin: number;
    distanceToLabelLine: number;
};

type LabelLineExtend = {
    showAbove: boolean;
    length: number;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
    maxSurfaceAngle: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Emphasis = Focusable & {
    disabled: boolean;
    scale: boolean;
    scaleSize: number;
};

type Data = {
    name: string;
    value: unknown;
    groupId: string;
    childGroupId: string;
    selected: boolean;
    label: Partial<Label>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    itemStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<ChangeableStyle & { disabled: boolean; }>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
    tooltip: Partial<AxisTooltip>;
};
