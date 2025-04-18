import { AxisTooltip } from "../Axis";
import { Decal, Orient, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { BasicSeries, Cartesian2dCoordinateSystem, Interactive, Markable, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem;

export type Boxplot = BasicSeries & CoordinateSystem & Interactive<ChangeableStyle> & Markable & {
    type: "boxplot";
    layout: Orient;
    boxWidth: [string | number, string | number];
    dimensions: Dimension[];
    encode: unknown;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type ChangeableStyle = {
    itemStyle: Partial<SymbolIconStyle>;
};

type Data = Omit<Interactive<ChangeableStyle>, "selectedMode"> & {
    name: string;
    value: [number, number, number, number, number];
    groupId: string;
    childGroupId: string;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    tooltip: Partial<AxisTooltip>;
};
