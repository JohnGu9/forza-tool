import { AxisPointer } from "./AxisPointer";
import { AnimationProps, Border, FormatterParams, NumSize, Padding } from "./common";
import { TextStyle } from "./TextStyle";

export type Tooltip = RenderMode & Border & {
    show: boolean;
    trigger: TooltipTrigger;
    axisPointer: Partial<AxisPointer & AnimationProps>;
    showContent: boolean;
    alwaysShowContent: boolean;
    triggerOn: "mousemove|click" | "mousemove" | "click" | "none";
    showDelay: number;
    hideDelay: number;
    enterable: boolean;
    confine: boolean;
    transitionDuration: number;
    position: TooltipPosition;
    formatter: string | ((params: FormatterParams | FormatterParams[], ticket: string, callback: (ticket: string, html: string) => unknown) => string | HTMLElement | HTMLElement[]);
    valueFormatter: (value: number | string, dataIndex: number) => string;
    backgroundColor: string;
    padding: Padding;
    textStyle: TextStyle;
    extraCssText: string;
    order: "seriesAsc" | "seriesDesc" | "valueAsc" | "valueDesc";
};

export type TooltipTrigger = "item" | "axis" | "none";

export type TooltipPosition = "inside" | "top" | "left" | "right" | "bottom" | (string | number)[] |
    ((point: [number, number], params: FormatterParams | FormatterParams[], dom: HTMLElement, rect: NumSize & { x: number, y: number; }, size: { contentSize: [number, number], viewSize: [number, number]; }) =>
        ((string | number)[] | Partial<{ top: string | number, left: string | number, right: string | number, bottom: string | number; }>));


export type RenderMode = {
    renderMode: "html";
    appendToBody: boolean;
    appendTo: string | HTMLElement | ((chartContainer: HTMLElement) => HTMLElement | undefined | null);
    className: string;
} | {
    renderMode: "richText";
};
