import { AxisTooltip } from "../Axis";
import { Decal, Focusable, PolarPosition, SymbolIconStyle } from "../common";
import { BasicSeries, Interactive, Label, LabelLayout, LabelLine, NodeClick } from "./common";

export type Sunburst = BasicSeries & PolarPosition & Interactive<ChangeableStyle, Emphasis> & {
    type: "sunburst";
    data: (Partial<Data> | unknown)[];
    nodeClick: NodeClick;
    sort: "desc" | "asc" | ((nodeA: unknown, nodeB: unknown) => number);
    renderLabelForZeroData: boolean;
    clockwise: boolean;
    startAngle: number;
    label: Partial<Label & { minMargin: number; rotate: "radial" | "tangential" | number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    levels: Partial<Level>[];

};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Data = Omit<Interactive<ChangeableStyle, {}>, "selectedMode"> & {
    name: string;
    value: string;
    link: string;
    target: "blank" | "self";
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    children: unknown[];
    tooltip: Partial<AxisTooltip>;
};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type ChangeableStyle = {
    label: Partial<Label & { minMargin: number; rotate: "radial" | "tangential" | number; }>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Emphasis = Focusable & {
};

type Level = ChangeableStyle & Omit<Interactive<ChangeableStyle>, "selectedMode"> & {
    radius: [string | number, string | number];
};
