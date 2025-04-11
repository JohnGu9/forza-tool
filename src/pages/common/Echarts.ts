import * as echarts from 'echarts';
import React from "react";

// reference: https://echarts.apache.org/en/option.html
// `echarts.EChartsCoreOption` is totally ultra-stupid useless type declaration
export default function useEcharts<T extends HTMLElement>(
    option: echarts.EChartsCoreOption | ((element: T, style: CSSStyleDeclaration, chart: echarts.ECharts) => echarts.EChartsCoreOption),
    notMerge?: boolean, lazyUpdate?: boolean) {
    const ref = React.useRef<T>(null);
    const [chart, setChart] = React.useState(null as echarts.ECharts | null);
    React.useEffect(() => {
        const chart = echarts.init(ref.current!);
        setChart(chart);
        const observer = new ResizeObserver(() => chart.resize());
        observer.observe(ref.current!);
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
                    min: (value: { min: unknown; }) => { return value.min; },
                    max: (value: { max: unknown; }) => { return value.max; },
                },
                yAxis: {
                    type: 'value',
                    min: (value: { min: unknown; }) => { return value.min; },
                    max: (value: { max: unknown; }) => { return value.max; },
                    axisLabel: {
                        formatter: (value: number) => {
                            return value.toFixed(0);
                        },
                    },
                },
                ...(typeof option === 'function' ? option(ref.current!, style, chart) : option)
            }, notMerge, lazyUpdate);
        }
    }, [chart, lazyUpdate, notMerge, option]);
    return ref;
}

export type TooltipParam = {
    componentType: 'series',
    // Series type
    seriesType: string,
    // Series index in option.series
    seriesIndex: number,
    // Series name
    seriesName: string,
    // Data name, or category name
    name: string,
    // Data index in input data array
    dataIndex: number,
    // Original data as input
    data: unknown,
    // Value of data. In most series it is the same as data.
    // But in some series it is some part of the data (e.g., in map, radar)
    value: number | Array<unknown> | unknown,
    // encoding info of coordinate system
    // Key: coord, like ('x' 'y' 'radius' 'angle')
    // value: Must be an array, not null/undefined. Contain dimension indices, like:
    // {
    //     x: [2] // values on dimension index 2 are mapped to x axis.
    //     y: [0] // values on dimension index 0 are mapped to y axis.
    // }
    encode: unknown,
    // dimension names list
    dimensionNames: Array<string>,
    // data dimension index, for example 0 or 1 or 2 ...
    // Only work in `radar` series.
    dimensionIndex: number,
    // Color of data
    color: string,
    // The percentage of current data item in the pie/funnel series
    percent: number,
    // The ancestors of current node in the sunburst series (including self)
    treePathInfo: Array<unknown>,
    // The ancestors of current node in the tree/treemap series (including self)
    treeAncestors: Array<unknown>,
    // A function that returns a boolean value to flag if the axis label is truncated
    isTruncated: () => unknown,
    // Current index of the axis label tick
    tickIndex: number;
};

export type TooltipFormatter = (params: TooltipParam | TooltipParam[], ticket: string) => string | HTMLElement | HTMLElement[];

// @TODO: create own `echarts.EChartsCoreOption`
