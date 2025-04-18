import { Orient, Position, Size, SymbolIcon, SymbolIconStyle, ZLevel } from "./common";
import { FilterMode } from "./DataZoom";
import { Tooltip } from "./Tooltip";

export type Toolbox = ZLevel & Position & Size & {
    id: string;
    show: boolean;
    orient: Orient;
    itemSize: number;
    itemGap: number;
    showTitle: boolean;
    feature: Partial<Feature>;
    iconStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<Emphasis>;
    tooltip: Partial<Tooltip>;
};

export type Feature = {
    saveAsImage: Partial<SaveAsImage>;
    restore: Partial<Restore>;
    dataView: Partial<DataView>;
    dataZoom: Partial<DataZoom>;
    magicType: Partial<MagicType>;
    brush: Partial<Brush>;
};

type FeatureItem = {
    show: boolean;
    title: string;
    icon: SymbolIcon;
    iconStyle: Partial<SymbolIconStyle>;
    emphasis: Partial<Emphasis>;
};

type Emphasis = {
    iconStyle: Partial<SymbolIconStyle & {
        textPosition: "bottom" | "top" | "left" | "right";
        textFill: string;
        textAlign: string;
        textBackgroundColor: string;
        textBorderRadius: number;
        textPadding: number;
    }>;
};

type SaveAsImage = FeatureItem & {
    type: "png" | "jpg" | "svg";
    name: string;
    backgroundColor: string;
    connectedBackgroundColor: string;
    excludeComponents: string[];
    pixelRatio: number;
};

type Restore = FeatureItem;

type DataView = FeatureItem & {
    readOnly: boolean;
    optionToContent: (option: unknown) => HTMLElement | string;
    contentToOption: (container: HTMLElement, option: unknown) => unknown;
    lang: [string, string, string];
    backgroundColor: string;
    textareaColor: string;
    textareaBorderColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
};

type DataZoom = FeatureItem & {
    filterMode: FilterMode;
    xAxisIndex: number | number[] | boolean;
    yAxisIndex: number | number[] | boolean;
    brushStyle: Partial<SymbolIconStyle>;
};

type MagicType = FeatureItem & {
    type: ("line" | "bar" | "stack")[];
    option: Partial<{
        line: unknown;
        bar: unknown;
        stack: unknown;
    }>;
    seriesIndex: Partial<{
        line: unknown[];
        bar: unknown[];
    }>;
};

export type ToolboxButton = "rect" | "polygon" | "lineX" | "lineY" | "keep" | "clear";

type Brush = {
    type: ToolboxButton;
    icon: Partial<BrushItem>;
    title: Partial<BrushItem>;
};

type BrushItem = {
    rect: SymbolIcon;
    polygon: SymbolIcon;
    lineX: SymbolIcon;
    lineY: SymbolIcon;
    keep: SymbolIcon;
    clear: SymbolIcon;
};
