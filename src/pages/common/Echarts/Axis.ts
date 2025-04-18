import { AreaStyle } from "./AreaStyle";
import { AxisPointer } from "./AxisPointer";
import { AnimationProps, Border, FormatterCallback, Padding, ZLevel } from "./common";
import { LineStyle } from "./LineStyle";
import { Name } from "./Name";
import { RichTextStyle, TextStyle } from "./TextStyle";
import { TooltipPosition } from "./Tooltip";

export type Axis = AxisType & Name & AnimationProps & ZLevel & {
    id: string;
    show: boolean;
    gridIndex: number;
    alignTicks: boolean;
    position: "top" | "bottom";
    offset: number;
    inverse: boolean;
    boundaryGap: boolean | [string | number, string | number];
    min: 'dataMin' | string | number | ((value: { min: number; max: number; }) => number);
    max: 'dataMax' | string | number | ((value: { min: number; max: number; }) => number);
    scale: boolean;
    startValue: number;
    silent: boolean;
    triggerEvent: boolean;
    axisLine: Partial<AxisLine & {
        onZero: boolean;
        onZeroAxisIndex: number;
    }>;
    axisTick: Partial<AxisTick>;
    minorTick: Partial<MinorTick>;
    axisLabel: Partial<AxisLabel & {
        alignMinLabel: "left" | "center" | "right";
        alignMaxLabel: "left" | "center" | "right";
    }>;
    splitLine: Partial<SplitLine>;
    minorSplitLine: Partial<MinorSplitLine>;
    splitArea: Partial<SplitArea>;
    data: AxisData;
    axisPointer: Partial<AxisPointer>;
    tooltip: Partial<AxisTooltip>;
};

export type AxisType = {
    type: "category";
} | {
    type: "value";
    splitNumber: number;
    minInterval: number;
    maxInterval: number;
    interval: number;
} | {
    type: "time";
    splitNumber: number;
    minInterval: number;
    maxInterval: number;
} | {
    type: "log";
    splitNumber: number;
    interval: number;
    logBase: number;
};

export type AxisLine = {
    show: boolean;
    symbol: [string | string, string | string];
    symbolSize: [number, number];
    symbolOffset: [number, number] | number;
    lineStyle: Partial<LineStyle>;
};

export type AxisTick = {
    show: boolean;
    alignWithLabel: boolean;
    interval: number | ((index: number, value: string) => boolean);
    inside: boolean;
    length: number;
    lineStyle: Partial<LineStyle>;
    customValues: number[] | string[];
};

export type MinorTick = {
    show: boolean;
    splitNumber: number;
    length: number;
    lineStyle: Partial<LineStyle>;
};

export type AxisLabel = RichTextStyle & {
    show: boolean;
    interval: number | ((index: number, value: string) => boolean);
    inside: boolean;
    rotate: number;
    margin: number;
    formatter: string | ((value: string | number, index: number) => string);
    showMinLabel: boolean;
    showMaxLabel: boolean;
    hideOverlap: boolean;
    customValues: number[] | string[];
    color: string | ((value: string) => string);
};

export type SplitLine = {
    show: boolean;
    showMinLine: boolean;
    showMaxLine: boolean;
    interval: number | ((index: number, value: string) => boolean);
    lineStyle: Partial<LineStyle>;
};

export type MinorSplitLine = {
    show: boolean;
    lineStyle: Partial<LineStyle>;
};

export type SplitArea = {
    show: boolean;
    interval: number | ((index: number, value: string) => boolean);
    areaStyle: Partial<AreaStyle>;
};

export type AxisData = (string | number |
    Partial<{ value: string, textStyle: Partial<RichTextStyle>; }> |
    Partial<{ value: number, textStyle: Partial<RichTextStyle>; }>)[];

export type AxisTooltip = Border & {
    show: boolean;
    position: TooltipPosition;
    formatter: string | FormatterCallback;
    valueFormatter: (value: number | string, dataIndex: number) => string;
    backgroundColor: string;
    padding: Padding;
    textStyle: Partial<TextStyle>;
    extraCssText: string;
};

