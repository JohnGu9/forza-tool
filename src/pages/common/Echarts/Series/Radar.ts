import { AreaStyle } from "../AreaStyle";
import { AxisTooltip } from "../Axis";
import { HasSymbol, SymbolIconStyle } from "../common";
import { LineStyle } from "../LineStyle";
import { BasicSeries, Interactive, Label, LabelLayout, UniversalTransition } from "./common";

export type Radar = BasicSeries & HasSymbol & Interactive<ChangeableStyle> & {
    type: "radar";
    radarIndex: number;
    label: Partial<Label & { minMargin: number; }>;
    labelLayout: Partial<LabelLayout>;
    lineStyle: Partial<LineStyle>;
    areaStyle: Partial<AreaStyle>;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    universalTransition: Partial<UniversalTransition>;
};

type ChangeableStyle = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
    areaStyle: Partial<AreaStyle>;
};

type Data = HasSymbol & {
    name: string;
    value: string;
    groupId: string;
    childGroupId: string;
    label: Partial<Label & { minMargin: number; }>;
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
    areaStyle: Partial<AreaStyle>;
    emphasis: Partial<ChangeableStyle & { disabled: boolean; }>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
    tooltip: Partial<AxisTooltip>;
};
