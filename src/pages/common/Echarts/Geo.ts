import { FormatterParams, Position, Projection, Roam, ScaleLimit, SimplePosition, SymbolIconStyle, ZLevel } from "./common";
import { SelectedMode } from "./Series/common";
import { RichTextStyle } from "./TextStyle";
import { Tooltip } from "./Tooltip";

export type Geo = ZLevel & Position & {
    id: string;
    show: boolean;
    map: string;
    roam: Roam;
    projection: Partial<Projection>;
    center: [number, number];
    aspectScale: number;
    boundingCoords: [number, number][];
    zoom: number;
    scaleLimit: Partial<ScaleLimit>;
    nameMap: { [key: string]: string; };
    nameProperty: string;
    selectedMode: Exclude<SelectedMode, "series">;
    label: Partial<Label>;
    itemStyle: Partial<ItemStyle>;
    emphasis: Partial<Emphasis>;
    select: Partial<Select>;
    blur: Partial<Blur>;
    layoutCenter: [number | string, number | string];
    layoutSize: number | string;
    regions: Partial<Region>[];
    silent: boolean;
    tooltip: Partial<Tooltip>;
};

type Label = RichTextStyle & {
    show: boolean;
    position: SimplePosition;
    distance: number;
    rotate: number;
    offset: [number | string, number | string];
    formatter: string | ((params: FormatterParams | FormatterParams[]) => string);
};

type ItemStyle = SymbolIconStyle & {
    areaColor: string;
};

type Emphasis = {
    disabled: boolean;
    focus: "none" | "self";
    label: Partial<Label>;
    itemStyle: Partial<ItemStyle>;
};

type Select = {
    disabled: boolean;
    label: Partial<Label>;
    itemStyle: Partial<ItemStyle>;
};

type Blur = {
    label: Partial<Label>;
    itemStyle: Partial<ItemStyle>;
};

type Region = {
    name: string;
    selected: boolean;
    label: Partial<Label>;
    itemStyle: Partial<ItemStyle>;
    emphasis: Partial<Emphasis>;
    select: Partial<Select>;
    blur: Partial<Blur>;
    tooltip: Partial<Tooltip>;
    silent: boolean;
};
