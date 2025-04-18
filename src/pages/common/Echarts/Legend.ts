import { Border, Decal, Orient, Padding, Position, Shadow, Size, SymbolIcon, SymbolIconStyle, ZLevel } from "./common";
import { LineStyle } from "./LineStyle";
import { SelectedMode } from "./Series/common";
import { RichText, RichTextStyle, TextStyle } from "./TextStyle";
import { Tooltip } from "./Tooltip";

export type Legend = Type & Position & Size & ZLevel & DataStyle & Border & Shadow & {
    id: string;
    show: boolean;
    orient: Orient;
    align: "auto" | "left" | "right";
    padding: Padding;
    itemGap: number;
    itemWidth: number;
    itemHeight: number;
    formatter: string | ((name: string) => string);
    selectedMode: Exclude<SelectedMode, "series">;
    selected: { [key: string]: boolean; };
    textStyle: Partial<TextStyle & RichText & Border & Shadow & { padding: Padding; }>;
    tooltip: Partial<Tooltip>;
    icon: SymbolIcon;
    data: Partial<DataStyle & {
        name: string;
        icon: SymbolIcon;
    }>[];
    backgroundColor: string;
    emphasis: Partial<Emphasis>;
    selector: boolean | SelectorType[] | { type: SelectorType, title: string; }[];
    selectorLabel: Partial<SelectorLabel>;
    selectorPosition: string;
    selectorItemGap: number;
    selectorButtonGap: number;
};

type Type = {
    type: "plain";
} | {
    type: "scroll";
    scrollDataIndex: number;
    pageButtonItemGap: number;
    pageButtonGap: number;
    pageButtonPosition: "start" | "end";
    pageFormatter: string | ((params: { current: number; total: number; }) => string);
    pageIcons: Partial<PageIcons>;
    pageIconColor: string;
    pageIconInactiveColor: string;
    pageIconSize: number;
    pageTextStyle: Partial<TextStyle>;
    animation: boolean;
    animationDurationUpdate: number;
};

export type PageIcons = {
    horizontal: [string, string];
    vertical: [string, string];
};

export type DataStyle = {
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    lineStyle: Partial<LineStyle & { inactiveColor: string; inactiveWidth: number; }>;
    inactiveColor: string;
    inactiveBorderColor: string;
    inactiveBorderWidth: "auto" | "inherit" | number;
    symbolRotate: number | 'inherit';
    textStyle: Partial<TextStyle & RichText>;
};


type Emphasis = {
    selectorLabel: Partial<SelectorLabel>;
};

export type SelectorType = "all" | "inverse";

export type SelectorLabel = RichTextStyle & {
    show: boolean;
    distance: number;
    rotate: number;
    offset: [number, number];
};
