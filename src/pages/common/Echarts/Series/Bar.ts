import { Property } from "csstype";

import { SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, Cartesian2dCoordinateSystem, Interactive, Label, LabelLayout, LabelLine, LargeScaleOptimization, Markable, PolarCoordinateSystem, Progressive, SeriesLayoutBy, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | PolarCoordinateSystem;

export type Bar = BasicSeries & CoordinateSystem & LargeScaleOptimization & Markable & Interactive<ChangeableStyle> & Progressive & {
    type: "bar";
    roundCap: boolean;
    realtimeSort: boolean;
    showBackground: boolean;
    backgroundStyle: Partial<SymbolIconStyle>;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine>;
    labelLayout: Partial<LabelLayout>;
    stack: string;
    stackStrategy: "samesign" | "all" | "positive" | "negative";
    sampling: "lttb" | "average" | "min" | "max" | "minmax" | "sum";
    cursor: Property.Cursor;
    barWidth: number | string;
    barMaxWidth: number | string;
    barMinWidth: number | string;
    barMinHeight: number;
    barMinAngle: number;
    barGap: string;
    barCategoryGap: number | string;
    dimensions: Dimension[];
    encode: unknown;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type ChangeableStyle = {
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Data = {
    name: string;
    value: unknown;
    groupId: string;
    childGroupId: string;
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<ChangeableStyle & { disabled: boolean; }>;
    blur: Partial<ChangeableStyle>;
    select: Partial<ChangeableStyle & { disabled: boolean; }>;
};
