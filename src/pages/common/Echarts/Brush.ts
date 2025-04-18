import { SymbolIconStyle } from "./common";
import { ToolboxButton } from "./Toolbox";
import { VisualMapItem } from "./VisualMap";

export type Brush = {
    id: string;
    toolbox: ToolboxButton[];
    brushLink: "all" | "none" | number[];
    seriesIndex: "all" | number[] | number;
    geoIndex: "all" | "none" | number[] | number;
    xAxisIndex: "all" | "none" | number[] | number;
    yAxisIndex: "all" | "none" | number[] | number;
    brushType: Exclude<ToolboxButton, "keep" | "clear">;
    brushMode: "single" | "multiple";
    transformable: boolean;
    brushStyle: Partial<SymbolIconStyle>;
    throttleType: "fixRate" | "debounce";
    throttleDelay: number;
    removeOnClick: boolean;
    inBrush: Partial<VisualMapItem>;
    outOfBrush: Partial<VisualMapItem>;
    z: number;
};
