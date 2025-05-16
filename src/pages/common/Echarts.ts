import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from "echarts/charts";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import type { GridComponentOption, LegendComponentOption, MarkLineComponentOption, MarkPointComponentOption, PolarComponentOption, TooltipComponentOption } from "echarts/components";
import { GridComponent, LegendComponent, MarkLineComponent, MarkPointComponent, PolarComponent, TooltipComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import React from "react";

// Create an Option type with only the required components and charts via ComposeOption
type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | PieSeriesOption
    | TooltipComponentOption
    | GridComponentOption
    | PolarComponentOption
    | MarkPointComponentOption
    | MarkLineComponentOption
    | LegendComponentOption
>;

// Register the required components
echarts.use([
    TooltipComponent,
    GridComponent,
    PolarComponent,
    MarkPointComponent,
    MarkLineComponent,
    LegendComponent,
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
    const [chart, setChart] = React.useState<echarts.ECharts | null>(null);
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
            const mergeOption: ECOption = {
                tooltip: {
                    show: true, // include tooltip component for the feature
                    trigger: "axis",
                },
                xAxis: {
                    type: "value",
                    show: false,
                    min: "dataMin",
                    max: "dataMax",
                },
                yAxis: {
                    type: "value",
                    min: "dataMin",
                    max: "dataMax",
                    axisLabel: {
                        formatter: (value) => {
                            return value.toFixed(0);
                        },
                    },
                },
                color: [
                    style.getPropertyValue("--md-sys-color-primary"),
                    style.getPropertyValue("--md-sys-color-tertiary"),
                    style.getPropertyValue("--md-sys-color-error"),
                    style.getPropertyValue("--md-sys-color-secondary"),
                    style.getPropertyValue("--md-sys-color-on-primary-fixed-variant"),
                    style.getPropertyValue("--md-sys-color-on-tertiary-fixed-variant"),
                    style.getPropertyValue("--md-sys-color-on-secondary-fixed-variant"),
                ],
                textStyle: {
                    fontFamily: "Roboto"
                },
                animation: false,
                ...(typeof option === "function" ?
                    option(style, ref.current!, chart) :
                    option)
            };
            chart.setOption(mergeOption, notMerge, lazyUpdate);
        }
    }, [chart, lazyUpdate, notMerge, option]);
    return ref;
}

export type OptionDataValue = string | number | Date | null | undefined;
