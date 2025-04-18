import { AxisTooltip } from "../Axis";
import { Decal, Orient, Position, Size, SymbolIconStyle } from "../common";
import { BasicSeries, Interactive, Label, LabelLayout } from "./common";

export type SanKey = BasicSeries & Position & Size & Interactive<ChangeableStyle> & {
    type: "sankey";
    nodeWidth: number;
    nodeGap: number;
    nodeAlign: "justify" | "left" | "right";
    layoutIterations: number;
    orient: Orient;
    draggable: boolean;
    edgeLabel: Partial<Label>;
    levels: Partial<Level>[];
    label: Partial<Label & { minMargin: number; }>;
    labelLayout: Partial<LabelLayout>;
    lineStyle: Partial<LineStyle>;
    data: (Partial<Data> | unknown)[];
    nodes: (Partial<Data> | unknown)[];
    links: Partial<Link>[];
    edges: Partial<Link>[];
    silent: boolean;
};

type Level = ChangeableStyle & Omit<Interactive<ChangeableStyle, { disabled: boolean; }>, "selectedMode"> & {
    depth: number;
};

type LineStyle = {
    color: string;
    opacity: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    edgeLabel: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
};

type Data = DataChangeableStyle & Omit<Interactive<DataChangeableStyle, { disabled: boolean; }>, "selectedMode"> & {
    name: string;
    value: number;
    depth: number;
    tooltip: Partial<AxisTooltip>;
};

type DataChangeableStyle = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
};

type Link = LinkChangeableStyle & Omit<Interactive<LinkChangeableStyle, { disabled: boolean; }>, "selectedMode"> & {
    source: string;
    target: string;
    value: number;
    edgeLabel: Partial<Label>;
    lineStyle: Partial<LineStyle>;

};

type LinkChangeableStyle = {
    edgeLabel: Partial<Label>;
    lineStyle: Partial<LineStyle>;
};
