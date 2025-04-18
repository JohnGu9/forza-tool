import { Property } from "csstype";

import { AxisTooltip } from "../Axis";
import { Decal, Position, Roam, ScaleLimit, Size, SymbolIcon, SymbolIconStyle } from "../common";
import { RichTextStyle } from "../TextStyle";
import { BasicSeries, Interactive, Label, LabelLayout, LabelLine, NodeClick } from "./common";

export type TreeMap = BasicSeries & Position & Size & Interactive<ChangeableStyle> & Omit<Level, "color"> & {
    type: "treemap";
    squareRatio: number;
    leafDepth: number;
    drillDownIcon: SymbolIcon;
    roam: Roam;
    scaleLimit: Partial<ScaleLimit>;
    nodeClick: NodeClick;
    zoomToNodeRatio: number;
    label: Partial<Label & { minMargin: number; }>;
    upperLabel: Partial<Label>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    breadcrumb: Partial<Breadcrumb>;
    levels: Partial<Level>[];
    data: (Partial<Data> | unknown)[];
    silent: boolean;
    cursor: Property.Cursor;
};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    upperLabel: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<ItemStyle>;
};
type ItemStyle = {
    color: string;
};

type Breadcrumb = Position & {
    show: boolean;
    height: number;
    emptyItemWidth: number;
    itemStyle: Partial<BreadcrumbItemStyle>;
    emphasis: Partial<{ itemStyle: Partial<BreadcrumbItemStyle>; }>;
};
type BreadcrumbItemStyle = SymbolIconStyle & {
    textStyle: Partial<RichTextStyle>;
};

type Level = Omit<Interactive<ChangeableStyle>, "selectedMode"> & {
    visualDimension: number;
    visualMin: number;
    visualMax: number;
    color: string[];
    colorAlpha: number[];
    colorSaturation: number[];
    colorMappingBy: "index" | "value" | "id";
    visibleMin: number;
    childrenVisibleMin: number;

    label: Partial<Label & { minMargin: number; }>;
    upperLabel: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
};


type Data = Level & {
    id: string;
    name: string;
    value: string;
    link: string;
    target: "blank" | "self";
    children: unknown[];
    tooltip: Partial<AxisTooltip>;
    cursor: Property.Cursor;
};
