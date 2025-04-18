import { AxisLabel, AxisLine, AxisTick, SplitArea, SplitLine } from "./Axis";
import { PolarPosition, ZLevel } from "./common";
import { RichTextStyle } from "./TextStyle";

export type Radar = PolarPosition & ZLevel & {
    id: string;
    startAngle: number;
    axisName: Partial<AxisName>;
    nameGap: number;
    splitNumber: number;
    shape: "polygon" | "circle";
    scale: boolean;
    silent: boolean;
    triggerEvent: boolean;
    axisLine: Partial<AxisLine>;
    axisTick: Partial<AxisTick>;
    axisLabel: Partial<AxisLabel>;
    splitLine: Partial<SplitLine>;
    splitArea: Partial<SplitArea>;
    indicator: Partial<Indicator>[];
};

type AxisName = RichTextStyle & {
    show: boolean;
    formatter: string | ((value: string, indicator: unknown) => string);
};

type Indicator = {
    name: string;
    max: number;
    min: number;
    color: string;
};
