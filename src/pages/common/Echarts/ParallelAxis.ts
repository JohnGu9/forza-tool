import { AxisData, AxisLabel, AxisLine, AxisTick, AxisTooltip, AxisType, MinorTick } from "./Axis";
import { AnimationProps, Border } from "./common";
import { Name } from "./Name";

export type ParallelAxis = AxisType & Name & AnimationProps & {
    id: string;
    dim: number;
    parallelIndex: number;
    realtime: boolean;
    areaSelectStyle: Partial<AreaSelectStyle>;
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
    data: AxisData;
    tooltip: Partial<AxisTooltip>;
};

type AreaSelectStyle = Border & {
    width: number;
    color: string;
    opacity: number;
};
