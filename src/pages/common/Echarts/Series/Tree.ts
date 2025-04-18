import { AxisTooltip } from "../Axis";
import { AnimationProps, Focusable, HasSymbol, PolarPosition, Position, Roam, Shadow, Size, SymbolIconStyle } from "../common";
import { BasicSeries, Interactive, Label, LabelLayout } from "./common";

export type Tree = BasicSeries & Position & Size & PolarPosition & HasSymbol & Interactive<ChangeableStyle> & {
    type: "tree";
    zoom: number;
    layout: "orthogonal" | "radial";
    orient: "LR" | "RL" | "TB" | "BT";
    edgeShape: "curve" | "polyline";
    edgeForkPosition: string;
    roam: Roam;
    expandAndCollapse: boolean;
    initialTreeDepth: number;
    label: Partial<Label & { minMargin: number; }>;
    labelLayout: Partial<LabelLayout>;
    lineStyle: Partial<LineStyle>;
    leaves: Partial<Leaves>;
    data: (Partial<Data> | unknown)[];
};

type LineStyle = Shadow & {
    color: string;
    width: number;
    curveness: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
};

type Emphasis = Focusable & {
    disabled: boolean;
};

type Leaves = ChangeableStyle & {
    emphasis: Partial<ChangeableStyle & Emphasis>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
};

type Data = AnimationProps & {
    name: string;
    value: string;
    collapsed: boolean;
    label: Partial<Label & { minMargin: number; }>;
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
    emphasis: Partial<ChangeableStyle & { disabled: boolean; }>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
    tooltip: Partial<AxisTooltip>;
};
