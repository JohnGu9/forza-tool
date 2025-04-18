import { Property } from "csstype";

import { AxisTooltip } from "../Axis";
import { Focusable, HasSymbol, Position, Roam, ScaleLimit, Size, SymbolIcon, SymbolIconStyle } from "../common";
import { LineStyle } from "../LineStyle";
import { BasicSeries, CalendarCoordinateSystem, Cartesian2dCoordinateSystem, GeoCoordinateSystem, Interactive, Label, LabelLayout, Markable, PolarCoordinateSystem } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | PolarCoordinateSystem | GeoCoordinateSystem | CalendarCoordinateSystem;

export type Graph = BasicSeries & CoordinateSystem & HasSymbol & Interactive<ChangeableStyle, Emphasis> & Markable & Position & Size & {
    type: "graph";
    center: [string | number, string | number];
    zoom: number;
    layout: "none" | "circular" | "force";
    circular: Partial<{ rotateLabel: boolean; }>;
    force: Partial<Force>;
    roam: Roam;
    scaleLimit: Partial<ScaleLimit>;
    nodeScaleRatio: number;
    draggable: boolean;
    edgeSymbol: SymbolIcon | [SymbolIcon, SymbolIcon];
    edgeSymbolSize: number | [number, number];
    cursor: Property.Cursor;
    lineStyle: Partial<LineStyle & { curveness: number; }>;
    label: Partial<Label & { minMargin: number; }>;
    edgeLabel: Partial<Label>;
    labelLayout: Partial<LabelLayout>;
    categories: Partial<Category>[];
    autoCurveness: boolean;
    data: (Partial<Data> | unknown)[];
    nodes: (Partial<Data> | unknown)[];
    links: Partial<Link>[];
    edges: Partial<Link>[];
    silent: boolean;
};

type Force = {
    initLayout: "none" | "circular" | "force";
    repulsion: number | number[];
    gravity: number;
    edgeLength: number | number[];
    layoutAnimation: boolean;
    friction: number;
};

type ChangeableStyle = {
    itemStyle: Partial<SymbolIconStyle>;
    lineStyle: Partial<LineStyle>;
    label: Partial<Label>;
    edgeLabel: Partial<Label>;
};

type Emphasis = Focusable & {
    disabled: boolean;
    scale: boolean;
};

type Category = HasSymbol & Omit<Interactive<CategoryChangeableStyle, { disabled: boolean; }>, "selectedMode"> & {
    name: string;
    itemStyle: Partial<SymbolIconStyle>;
    label: Partial<Label>;
};

type CategoryChangeableStyle = {
    itemStyle: Partial<SymbolIconStyle>;
    label: Partial<Label>;
};

type Data = HasSymbol & CategoryChangeableStyle & Omit<Interactive<CategoryChangeableStyle, { disabled: boolean; }>, "selectedMode"> & {
    name: string;
    x: number;
    y: number;
    fixed: boolean;
    value: number | number[];
    category: number;
    tooltip: Partial<AxisTooltip>;
};

type Link = Omit<Interactive<LinkChangeableStyle, { disabled: boolean; }>, "selectedMode"> & HasSymbol & {
    source: string | number;
    target: string | number;
    value: number;
    lineStyle: Partial<LineStyle & { curveness: number; }>;
    label: Partial<Label>;
    ignoreForceLayout: boolean;
};

type LinkChangeableStyle = {
    lineStyle: Partial<LineStyle & { curveness: number; }>;
    label: Partial<Label>;
};
