import { SymbolIconStyle } from "../common";
import { BasicSeries, CalendarCoordinateSystem, Cartesian2dCoordinateSystem, GeoCoordinateSystem, Interactive, Label, LabelLayout, Markable, Progressive, SeriesLayoutBy, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | GeoCoordinateSystem | CalendarCoordinateSystem;

export type Heatmap = BasicSeries & CoordinateSystem & Interactive<ChangeableStyle> & Markable & Progressive & {
    type: "heatmap";
    pointSize: number;
    blurSize: number;
    minOpacity: number;
    maxOpacity: number;
    label: Partial<Label & { minMargin: number; }>;
    labelLayout: Partial<LabelLayout>;
    encode: unknown;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type ChangeableStyle = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Data = {
    name: string;
    value: unknown[];
    groupId: string;
    childGroupId: string;
    label: Partial<Label & { minMargin: number; }>;
    itemStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<{ disabled: boolean; label: Partial<Label>; itemStyle: Partial<SymbolIconStyle>; }>;
};
