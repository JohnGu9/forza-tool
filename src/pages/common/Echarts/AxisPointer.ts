import { Border, FormatterCallback, Padding, Shadow, SymbolIcon } from "./common";
import { LineStyle } from "./LineStyle";
import { ShadowStyle } from "./ShadowStyle";
import { TextStyle } from "./TextStyle";

export type AxisPointer = {
    id: string;
    show: boolean;
    type: "line" | "shadow" | "none";
    z: number;
    label: Partial<TextStyle & Border & Shadow & {
        show: boolean;
        precision: number | string;
        formatter: string | FormatterCallback;
        margin: number;
        padding: Padding;
        backgroundColor: string;
    }>;
    lineStyle: Partial<LineStyle>;
    shadowStyle: Partial<ShadowStyle>;
    triggerEmphasis: boolean;
    triggerTooltip: boolean;
    value: number;
    status: boolean | "show" | "hide";
    handle: Partial<Handle>;
    link: unknown[];
    triggerOn: "mousemove|click" | "mousemove" | "click" | "none";
};

export type Handle = Shadow & {
    show: boolean;
    icon: SymbolIcon;
    size: number | [number, number];
    margin: number;
    color: string;
    throttle: number;
};
