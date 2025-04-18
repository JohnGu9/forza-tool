import { LineStyle } from "../LineStyle";
import { BasicSeries, ParallelCoordinateSystem, Progressive } from "./common";

type CoordinateSystem = ParallelCoordinateSystem;

export type Parallel = BasicSeries & CoordinateSystem & Progressive & {
    type: "parallel";
    lineStyle: Partial<LineStyle>;
    emphasis: Partial<{ disabled: boolean; lineStyle: Partial<LineStyle>; }>;
    inactiveOpacity: number;
    activeOpacity: number;
    realtime: boolean;
    smooth: boolean | number;
    data: (Partial<Data> | unknown)[];
};

type Data = {
    name: string;
    value: unknown[];
    lineStyle: Partial<LineStyle>;
    emphasis: Partial<{ disabled: boolean; lineStyle: Partial<LineStyle>; }>;
};
