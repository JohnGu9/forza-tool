import type {
    // The series option types are defined with the SeriesOption suffix
    BarSeriesOption,
    LineSeriesOption,
    PieSeriesOption,
} from 'echarts/charts';
import {
    BarChart,
    LineChart,
    PieChart,
} from 'echarts/charts';
import type {
    GridComponentOption,
    PolarComponentOption,
    TooltipComponentOption
} from 'echarts/components';
import {
    GridComponent,
    PolarComponent,
    TooltipComponent,
} from 'echarts/components';
import type {
    ComposeOption,
} from 'echarts/core';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React from "react";


// Create an Option type with only the required components and charts via ComposeOption
type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | PieSeriesOption
    | TooltipComponentOption
    | GridComponentOption
    | PolarComponentOption
>;

// Register the required components
echarts.use([
    TooltipComponent,
    GridComponent,
    PolarComponent,
    BarChart,
    LineChart,
    PieChart,
    CanvasRenderer
]);

// reference: https://echarts.apache.org/en/option.html
export function useEcharts<T extends HTMLElement>(
    option: ECOption | ((style: CSSStyleDeclaration, element: T, chart: echarts.ECharts) => ECOption),
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
                ...(typeof option === 'function' ?
                    option(style, ref.current!, chart) :
                    option)
            }, notMerge, lazyUpdate);
        }
    }, [chart, lazyUpdate, notMerge, option]);
    return ref;
}

export type OptionDataValue = string | number | Date | null | undefined;
