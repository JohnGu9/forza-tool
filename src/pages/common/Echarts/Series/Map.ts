import { AxisTooltip } from "../Axis";
import { Position, Projection, Roam, ScaleLimit, SymbolIconStyle } from "../common";
import { BasicSeries, Interactive, Label, LabelLayout, LabelLine, Markable, SeriesLayoutBy, UniversalTransition } from "./common";

export type SeriesMap = BasicSeries & Interactive<ChangeableStyle, Emphasis> & Position & Markable & {
    type: "map";
    map: string;
    roam: Roam;
    projection: Partial<Projection>;
    center: [string | number, string | number];
    aspectScale: number;
    boundingCoords: [number, number][];
    zoom: number;
    scaleLimit: Partial<ScaleLimit>;
    nameMap: { [key: string]: string; };
    nameProperty: string;
    label: Partial<Label & { minMargin: number; }>;
    itemStyle: Partial<ItemStyle>;
    layoutCenter: [string | number, string | number];
    layoutSize: string | number;
    geoIndex: number;
    mapValueCalculation: "sum" | "average" | "max" | "min";
    showLegendSymbol: boolean;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    labelLayout: Partial<LabelLayout>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    data: (Partial<Data> | unknown)[];
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type ItemStyle = SymbolIconStyle & {
    areaColor: string;
};

type ChangeableStyle = {
    label: Partial<Label>;
    itemStyle: Partial<ItemStyle>;
};

type Emphasis = {
    disabled: boolean;
};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type Data = Omit<Interactive<ChangeableStyle, Emphasis>, "selectedMode"> & {
    name: string;
    value: number;
    groupId: string;
    childGroupId: string;
    selected: boolean;
    silent: boolean;
    itemStyle: Partial<ItemStyle>;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    tooltip: Partial<AxisTooltip>;
};
