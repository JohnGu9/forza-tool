import { AxisData, AxisLabel, AxisLine, AxisTick, AxisTooltip, AxisType, MinorSplitLine, MinorTick, SplitArea, SplitLine } from "./Axis";
import { AxisPointer } from "./AxisPointer";
import { AnimationProps, ZLevel } from "./common";
import { Name } from "./Name";

export type RadiusAxis = AxisType & Name & AnimationProps & ZLevel & {
    id: string;
    polarIndex: number;
    inverse: boolean;
    boundaryGap: boolean | [string | number, string | number];
    min: 'dataMin' | string | number | ((value: { min: number; max: number; }) => number);
    max: 'dataMax' | string | number | ((value: { min: number; max: number; }) => number);
    scale: boolean;
    startValue: number;
    silent: boolean;
    triggerEvent: boolean;
    axisLine: Partial<AxisLine>;
    axisTick: Partial<AxisTick>;
    minorTick: Partial<MinorTick>;
    axisLabel: Partial<AxisLabel>;
    splitLine: Partial<SplitLine>;
    minorSplitLine: Partial<MinorSplitLine>;
    splitArea: Partial<SplitArea>;
    data: AxisData;
    axisPointer: Partial<AxisPointer>;
    tooltip: Partial<AxisTooltip>;
};

