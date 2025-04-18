import { AreaStyle } from "./AreaStyle";
import { Border, Orient, Position, Size, SymbolIcon, SymbolIconStyle, ZLevel } from "./common";
import { LineStyle } from "./LineStyle";
import { TextStyle } from "./TextStyle";

export type DataZoom = Partial<InsideDataZoom> | Partial<SliderDataZoom> | (Partial<InsideDataZoom> | Partial<SliderDataZoom>)[];

export type InsideDataZoom = {
    type: "inside";
    id: string;
    disabled: boolean;
    xAxisIndex: number | number[];
    yAxisIndex: number | number[];
    radiusAxisIndex: number | number[];
    angleAxisIndex: number | number[];
    filterMode: FilterMode;
    start: number;
    end: number;
    startValue: number | string | Date;
    endValue: number | string | Date;
    minSpan: number;
    maxSpan: number;
    minValueSpan: number | string | Date;
    maxValueSpan: number | string | Date;
    orient: Orient;
    zoomLock: boolean;
    throttle: number;
    rangeMode: ["value" | "percent", "value" | "percent"];
    zoomOnMouseWheel: boolean | "shift" | "ctrl" | "alt";
    moveOnMouseMove: boolean | "shift" | "ctrl" | "alt";
    moveOnMouseWheel: boolean | "shift" | "ctrl" | "alt";
    preventDefaultMouseMove: boolean;
};

export type SliderDataZoom = Border & ZLevel & Position & Size & {
    type: "slider";
    id: string;
    show: boolean;
    backgroundColor: string;
    dataBackground: Partial<DataBackground>;
    selectedDataBackground: Partial<DataBackground>;
    fillerColor: string;
    handleIcon: SymbolIcon;
    handleSize: number | string;
    handleStyle: Partial<SymbolIconStyle>;
    handleLabel: Partial<{ show: boolean; }>;
    moveHandleIcon: SymbolIcon;
    moveHandleSize: number;
    moveHandleStyle: Partial<SymbolIconStyle>;
    labelPrecision: number | string;
    labelFormatter: (value: unknown, valueStr: string) => string;
    showDetail: boolean;
    showDataShadow: string;
    realtime: boolean;
    textStyle: Partial<TextStyle>;
    xAxisIndex: number | number[];
    yAxisIndex: number | number[];
    radiusAxisIndex: number | number[];
    angleAxisIndex: number | number[];
    filterMode: FilterMode;
    start: number;
    end: number;
    startValue: number | string | Date;
    endValue: number | string | Date;
    minSpan: number;
    maxSpan: number;
    minValueSpan: number | string | Date;
    maxValueSpan: number | string | Date;
    orient: Orient;
    zoomLock: boolean;
    throttle: number;
    rangeMode: ["value" | "percent", "value" | "percent"];
    brushSelect: boolean;
    brushStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<Emphasis>;
};

export type FilterMode = "filter" | "weakFilter" | "empty" | "none";

type DataBackground = {
    lineStyle: Partial<LineStyle>;
    areaStyle: Partial<AreaStyle>;
};

type Emphasis = {
    handleStyle: Partial<SymbolIconStyle>;
    handleLabel: Partial<{ show: boolean; }>;
    moveHandleStyle: Partial<SymbolIconStyle>;
};
