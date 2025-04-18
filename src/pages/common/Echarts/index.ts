import * as echarts from 'echarts';
import React from "react";

import { AngleAxis } from './AngleAxis';
import { Aria } from './Aria';
import { Axis } from './Axis';
import { AxisPointer } from './AxisPointer';
import { Brush } from './Brush';
import { Calendar } from './Calendar';
import { AnimationProps } from './common';
import { Dataset } from './Dataset';
import { DataZoom } from './DataZoom';
import { Geo } from './Geo';
import { Graphic } from './Graphic';
import { Grid } from './Grid';
import { Legend } from './Legend';
import { Parallel } from './Parallel';
import { ParallelAxis } from './ParallelAxis';
import { Polar } from './Polar';
import { Radar } from './Radar';
import { RadiusAxis } from './RadiusAxis';
import { Series } from './Series';
import { SingleAxis } from './SingleAxis';
import { StateAnimation } from './StateAnimation';
import { TextStyle } from './TextStyle';
import { Timeline } from './Timeline';
import { Title } from './Title';
import { Toolbox } from './Toolbox';
import { Tooltip } from './Tooltip';
import { VisualMap } from './VisualMap';

// reference: https://echarts.apache.org/en/option.html
// `echarts.EChartsCoreOption` is totally ultra-stupid useless type declaration
export function useEcharts<T extends HTMLElement>(
    option: Partial<EChartsOption> | ((style: CSSStyleDeclaration, element: T, chart: echarts.ECharts) => Partial<EChartsOption>),
    notMerge?: boolean, lazyUpdate?: boolean) {
    const ref = React.useRef<T>(null);
    const [chart, setChart] = React.useState(null as echarts.ECharts | null);
    React.useEffect(() => {
        const chart = echarts.init(ref.current!);
        const observer = new ResizeObserver(() => chart.resize());
        observer.observe(ref.current!);
        setChart(chart);
        return () => {
            observer.disconnect();
            echarts.dispose(chart);
        };
    }, []);
    React.useEffect(() => {
        if (chart !== null) {
            const style = getComputedStyle(ref.current!);
            chart.setOption({
                animation: false,
                textStyle: {
                    fontFamily: 'Roboto'
                },
                color: [
                    style.getPropertyValue('--md-sys-color-primary'),
                    style.getPropertyValue('--md-sys-color-tertiary'),
                    style.getPropertyValue('--md-sys-color-error'),
                ],
                tooltip: {
                    show: true // include tooltip component for the feature
                },
                xAxis: {
                    show: false,
                    type: "value",
                    min: (value: { min: number; }) => { return value.min; },
                    max: (value: { max: number; }) => { return value.max; },
                },
                yAxis: {
                    type: 'value',
                    min: (value: { min: number; }) => { return value.min; },
                    max: (value: { max: number; }) => { return value.max; },
                    axisLabel: {
                        formatter: (value: number) => {
                            return value.toFixed(0);
                        },
                    },
                },
                ...(typeof option === 'function' ? option(style, ref.current!, chart) : option)
            }, notMerge, lazyUpdate);
        }
    }, [chart, lazyUpdate, notMerge, option]);
    return ref;
}

// @TODO: create own EChartsOption

export type EChartsOption = {
    title: Partial<Title>;
    legend: Partial<Legend>;
    grid: Partial<Grid> | Partial<Grid>[];
    xAxis: Partial<Axis> | Partial<Axis>[];
    yAxis: Partial<Axis> | Partial<Axis>[];
    polar: Partial<Polar> | Partial<Polar>[];
    tooltip: Partial<Tooltip>;
    radiusAxis: Partial<RadiusAxis> | Partial<RadiusAxis>[];
    angleAxis: Partial<AngleAxis> | Partial<AngleAxis>[];
    radar: Partial<Radar> | Partial<Radar>[];
    dataZoom: DataZoom;
    visualMap: VisualMap;
    axisPointer: Partial<AxisPointer>;
    toolbox: Partial<Toolbox>;
    brush: Partial<Brush>;
    geo: Partial<Geo> | Partial<Geo>[];
    parallel: Partial<Parallel> | Partial<Parallel>[];
    parallelAxis: Partial<ParallelAxis> | Partial<ParallelAxis>[];
    singleAxis: Partial<SingleAxis> | Partial<SingleAxis>[];
    timeline: Partial<Timeline>;
    graphic: Partial<Graphic>;
    calendar: Partial<Calendar> | Partial<Calendar>[];
    dataset: Partial<Dataset> | Partial<Dataset>[];
    aria: Partial<Aria>;
    series: Series;
    darkMode: boolean;
    color: string[];
    backgroundColor: string;
    textStyle: Partial<TextStyle>;
    stateAnimation: Partial<StateAnimation>;
    blendMode: GlobalCompositeOperation;
    hoverLayerThreshold: number;
    useUTC: boolean;
    options: Partial<EChartsOption>[];
    media: {
        query?: MediaQuery;
        option: EChartsOption;
    }[];
} & AnimationProps;

export interface MediaQuery {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    minAspectRatio?: number;
    maxAspectRatio?: number;
}
