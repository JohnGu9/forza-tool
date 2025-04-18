import { Orient, Position, Size, SymbolIconStyle, ZLevel } from "./common";
import { LineStyle } from "./LineStyle";
import { RichTextStyle } from "./TextStyle";

export type Calendar = ZLevel & Position & Size & {
    id: string;
    range: number | string | string[];
    cellSize: number | string | [number | string] | [number | string, number | string];
    orient: Orient;
    splitLine: Partial<SplitLine>;
    itemStyle: Partial<SymbolIconStyle>;
    dayLabel: Partial<DayLabel>;
    monthLabel: Partial<MonthLabel>;
    yearLabel: Partial<YearLabel>;
    silent: boolean;
};

type SplitLine = {
    show: boolean;
    lineStyle: Partial<LineStyle>;
};

type DayLabel = RichTextStyle & {
    show: boolean;
    firstDay: number;
    margin: number;
    position: "start" | "end";
    nameMap: string | string[];
    silent: boolean;
};

type MonthLabel = RichTextStyle & {
    show: boolean;
    margin: number;
    position: "start" | "end";
    nameMap: string | string[];
    formatter: string | ((param: { nameMap: string | string[]; yyyy: unknown; yy: unknown; MM: unknown; M: unknown; }) => string);
    silent: boolean;
};

type YearLabel = {
    show: boolean;
    margin: number;
    position: "start" | "end";
    formatter: string | ((param: { nameMap: string | string[]; start: unknown; end: unknown; }) => string);
    silent: boolean;
};
