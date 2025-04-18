import { Property } from "csstype";

import { AxisTooltip } from "../Axis";
import { AnimationProps, Decal, Focusable, SymbolIcon, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, Cartesian2dCoordinateSystem, Interactive, Label, LabelLayout, LabelLine, Markable, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem;

export type PictorialBar = BasicSeries & CoordinateSystem & Interactive<ChangeableStyle, Emphasis> & HasSymbol & Markable & {
    type: "pictorialBar";
    cursor: Property.Cursor;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    barWidth: string | number;
    barMaxWidth: string | number;
    barMinWidth: string | number;
    barMinHeight: number;
    barMinAngle: number;
    barGap: string;
    barCategoryGap: string | number;
    dimensions: Dimension[];
    encode: unknown;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Emphasis = Focusable & {
    disabled: boolean;
    scale: boolean;
};

type HasSymbol = {
    symbol: SymbolIcon;
    symbolSize: string | number | [string | number, string | number];
    symbolPosition: "start" | "end" | "center";
    symbolOffset: string | number | [string | number, string | number];
    symbolRotate: number;
    symbolRepeat: boolean | number | "fixed";
    symbolRepeatDirection: "start" | "end";
    symbolMargin: string | number;
    symbolClip: boolean;
    symbolBoundingData: number;
    symbolPatternSize: number;
};

type Data = HasSymbol & AnimationProps & Omit<Interactive<ChangeableStyle, Emphasis>, "selectedMode"> & {
    name: string;
    value: number;
    groupId: string;
    childGroupId: string;
    z: number;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    tooltip: Partial<AxisTooltip>;
};
