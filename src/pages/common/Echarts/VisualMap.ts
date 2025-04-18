import { Border, Orient, Padding, Position, SymbolIcon, SymbolIconStyle, ZLevel } from "./common";
import { SelectedMode } from "./Series/common";
import { TextStyle } from "./TextStyle";

export type VisualMap = Partial<ContinuousVisualMap> | Partial<PiecewiseVisualMap> | (Partial<ContinuousVisualMap> | Partial<PiecewiseVisualMap>)[];

export type ContinuousVisualMap = ZLevel & Position & Border & {
    type: "continuous";
    id: string;
    min: number;
    max: number;
    range: [number, number];
    calculable: boolean;
    realtime: boolean;
    inverse: boolean;
    precision: number;
    itemWidth: number;
    itemHeight: number;
    align: "auto" | "left" | "right" | "top" | "bottom";
    text: [string, string];
    textGap: number;
    show: boolean;
    dimension: string; // ???
    seriesIndex: number | number[];
    hoverLink: boolean;
    inRange: Partial<VisualMapItem>;
    outOfRange: Partial<VisualMapItem>;
    controller: Partial<Controller>;
    orient: Orient;
    padding: Padding;
    backgroundColor: string;
    color: string | string[];
    textStyle: Partial<TextStyle>;
    formatter: string | ((value: unknown) => string);
    handleIcon: SymbolIcon;
    handleSize: string | number;
    handleStyle: Partial<SymbolIconStyle>;
    indicatorIcon: SymbolIcon;
    indicatorSize: string | number;
    indicatorStyle: Partial<SymbolIconStyle>;
};

export type PiecewiseVisualMap = ZLevel & Position & Border & {
    type: "piecewise";
    id: string;
    splitNumber: number;
    pieces: Partial<Pieces>[];
    categories: string[];
    min: number;
    max: number;
    minOpen: boolean;
    maxOpen: boolean;
    selectedMode: Exclude<SelectedMode, "series">;
    inverse: boolean;
    precision: number;
    itemWidth: number;
    itemHeight: number;
    align: "auto" | "left" | "right";
    text: [string, string];
    textGap: number;
    showLabel: boolean;
    itemGap: number;
    itemSymbol: SymbolIcon;
    show: boolean;
    dimension: string; // ???
    seriesIndex: number | number[];
    hoverLink: boolean;
    inRange: Partial<VisualMapItem>;
    outOfRange: Partial<VisualMapItem>;
    controller: Partial<Controller>;
    orient: Orient;
    padding: Padding;
    backgroundColor: string;
    color: string | string[];
    textStyle: Partial<TextStyle>;
    formatter: string | ((value: unknown, value2: unknown) => string);
};

export type VisualMapItem = {
    symbol: SymbolIcon | SymbolIcon[];
    symbolSize: number | [number, number];
    color: string | string[];
    colorAlpha: number | [number, number];
    opacity: number | [number, number];
    colorLightness: number | [number, number];
    colorSaturation: number | [number, number];
    colorHue: number | [number, number];
};

type Controller = {
    inRange: Partial<VisualMapItem>;
    outOfRange: Partial<VisualMapItem>;
};

type Pieces = VisualMapItem & { min: number; max: number; label: string; };
