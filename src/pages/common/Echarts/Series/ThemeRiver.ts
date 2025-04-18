import { Position, Size, SymbolIconStyle } from "../common";
import { BasicSeries, Interactive, Label, LabelLayout, LabelLine, SingleCoordinateSystem } from "./common";

type CoordinateSystem = SingleCoordinateSystem;

export type ThemeRiver = BasicSeries & Position & Size & CoordinateSystem & Interactive<ChangeableStyle> & {
    type: "themeRiver";
    boundaryGap: [string | number, string | number];
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    data: (Partial<Data> | unknown)[];

};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Data = {
    name: string;
    value: number;
    date: string;
};
