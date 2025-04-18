import { AxisTooltip } from "../Axis";
import { AnimationProps, Decal, Focusable, FormatterParams, HasSymbol, NumSize, SimplePosition, SymbolIconStyle, ZLevel } from "../common";
import { LineStyle } from "../LineStyle";
import { Align, RichTextStyle, VerticalAlign } from "../TextStyle";

export type BasicSeries = ZLevel & AnimationProps & {
    id: string;
    name: string;
    colorBy: "series" | "data";
    legendHoverLink: boolean;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    tooltip: Partial<AxisTooltip>;
};

export type Cartesian2dCoordinateSystem = {
    coordinateSystem: "cartesian2d";
    xAxisIndex: number;
    yAxisIndex: number;
};
export type PolarCoordinateSystem = {
    coordinateSystem: "polar";
    polarIndex: number;
};
export type GeoCoordinateSystem = {
    coordinateSystem: "geo";
    geoIndex: number;
};
export type CalendarCoordinateSystem = {
    coordinateSystem: "calendar";
    calendarIndex: number;
};
export type ParallelCoordinateSystem = {
    coordinateSystem: "parallel";
    parallelIndex: number;
};
export type SingleCoordinateSystem = {
    coordinateSystem: "single";
    singleAxisIndex: number;
};


export type Label = RichTextStyle & {
    show: boolean;
    position: SimplePosition;
    distance: number;
    rotate: number;
    offset: [number | string, number | string];
    formatter: string | ((params: FormatterParams | FormatterParams[]) => string);
};

export type LabelLine = {
    show: boolean;
    lineStyle: Partial<LineStyle>;
};

export type LabelLayout = NumSize & {
    hideOverlap: boolean;
    moveOverlap: "shiftX" | "shiftY";
    x: number | string;
    y: number | string;
    dx: number;
    dy: number;
    rotate: number;
    align: Align;
    verticalAlign: VerticalAlign;
    fontSize: number;
    draggable: boolean;
    labelLinePoints: [number, number][];
};

export type MarkPoint = MarkPointChangeableProps & HasSymbol & AnimationProps & {
    silent: boolean;
    emphasis: Partial<MarkPointChangeableProps & { disabled: boolean; }>;
    blur: Partial<MarkPointChangeableProps>;
    data: Partial<MarkPointData>[];
};

type MarkPointChangeableProps = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
};

export type MarkPointData = MarkPointChangeableProps & HasSymbol & {
    name: string;
    type: "min" | "max" | "average";
    valueIndex: number;
    valueDim: string;
    coord: unknown[];
    x: number;
    y: number;
    value: number;
    emphasis: Partial<MarkPointChangeableProps & { disabled: boolean; }>;
};

export type MarkLine = MarkLineChangeableProps & HasSymbol & AnimationProps & {
    silent: boolean;
    precision: number;
    emphasis: Partial<MarkLineChangeableProps & { disabled: boolean; }>;
    blur: Partial<MarkLineChangeableProps>;
    data: Partial<MarkLineData>[];
};

type MarkLineChangeableProps = {
    label: Partial<Label>;
    lineStyle: Partial<LineStyle>;
};

export type MarkLineData = MarkLineChangeableProps & HasSymbol & {
    name: string;
    type: "min" | "max" | "average" | "median";
    valueIndex: number;
    valueDim: string;
    coord: unknown[];
    x: number;
    y: number;
    value: number;
    xAxis: number | string;
    yAxis: number | string;
    emphasis: Partial<MarkLineChangeableProps & { disabled: boolean; }>;
    blur: Partial<MarkLineChangeableProps>;
};


export type MarkArea = MarkAreaChangeableProps & AnimationProps & {
    silent: boolean;
    emphasis: Partial<MarkPointChangeableProps & { disabled: boolean; }>;
    blur: Partial<MarkPointChangeableProps>;
    data: Partial<MarkAreaData>[];
};

type MarkAreaChangeableProps = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
};

export type Markable = {
    markPoint: Partial<MarkPoint>;
    markLine: Partial<MarkLine>;
    markArea: Partial<MarkArea>;

};

export type MarkAreaData = MarkAreaChangeableProps & {
    name: string;
    type: "min" | "max" | "average";
    valueIndex: number;
    valueDim: string;
    coord: unknown[];
    x: number;
    y: number;
    value: number;
    emphasis: Partial<MarkPointChangeableProps & { disabled: boolean; }>;
    blur: Partial<MarkPointChangeableProps>;
};

export type UniversalTransition = {
    enabled: boolean;
    seriesKey: string | string[];
    divideShape: "split" | "clone";
    delay: (index: number, count: number) => number;
};

export type LargeScaleOptimization = {
    large: boolean;
    largeThreshold: number;
};

export type SelectedMode = boolean | "single" | "multiple" | "series";

export type Interactive<ChangeableStyle, Emphasis = DefaultEmphasis> = {
    emphasis: Partial<ChangeableStyle & Emphasis>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
    selectedMode: SelectedMode;
};

export type DefaultEmphasis = Focusable & {
    disabled: boolean;
};

export type NodeClick = false | "zoomToNode" | "link";

export type SeriesLayoutBy = "column" | "row";

export type Progressive = {
    progressive: number;
    progressiveThreshold: number;
    progressiveChunkMode: "sequential" | "mod";
};
