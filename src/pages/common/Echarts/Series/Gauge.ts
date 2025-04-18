import { PolarPosition, SymbolIcon, SymbolIconStyle } from "../common";
import { RichTextStyle } from "../TextStyle";
import { BasicSeries, Label, LabelLine, Markable } from "./common";

export type Gauge = BasicSeries & PolarPosition & Markable & {
    type: "gauge";
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
    data: (Partial<Data> | unknown)[];
    min: number;
    max: number;
    splitNumber: number;
    axisLine: Partial<LabelLine & { roundCap: boolean; }>;
    progress: Partial<Progress>;
    splitLine: Partial<LabelLine & { length: string | number; distance: number; }>;
    axisTick: Partial<LabelLine & { length: string | number; distance: number; splitNumber: number; }>;
    axisLabel: Partial<Label>;
    pointer: Partial<Pointer>;
    anchor: Partial<Anchor>;
    emphasis: Partial<{ disabled: boolean; itemStyle: Partial<SymbolIconStyle>; }>;
    title: Partial<Title>;
    detail: Partial<Detail>;
    silent: boolean;
};

type Data = {
    name: string;
    value: number;
    title: Partial<Title>;
    detail: Partial<Detail>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Title = RichTextStyle & {
    show: boolean;
    offsetCenter: [string | number, string | number];
    valueAnimation: boolean;
};

type Detail = RichTextStyle & {
    show: boolean;
    offsetCenter: [string | number, string | number];
    valueAnimation: boolean;
    formatter: string | ((value: number) => string);
};

type Progress = {
    show: boolean;
    overlap: boolean;
    width: number;
    roundCap: boolean;
    clip: boolean;
    itemStyle: Partial<SymbolIconStyle>;
};

type Pointer = {
    show: boolean;
    showAbove: boolean;
    icon: SymbolIcon;
    offsetCenter: [string | number, string | number];
    length: string | number;
    width: number;
    keepAspect: boolean;
    itemStyle: Partial<SymbolIconStyle>;
};

type Anchor = {
    show: boolean;
    showAbove: boolean;
    size: number;
    icon: SymbolIcon;
    offsetCenter: [string | number, string | number];
    keepAspect: boolean;
    itemStyle: Partial<SymbolIconStyle>;
};
