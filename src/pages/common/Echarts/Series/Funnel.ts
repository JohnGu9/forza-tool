import { AxisTooltip } from "../Axis";
import { Decal, Orient, Position, Size, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { Align } from "../TextStyle";
import { BasicSeries, Interactive, Label, LabelLayout, LabelLine, Markable, SeriesLayoutBy, UniversalTransition } from "./common";

export type Funnel = BasicSeries & Interactive<ChangeableStyle> & Position & Size & Markable & {
    type: "funnel";
    min: number;
    max: number;
    minSize: number | string;
    maxSize: number | string;
    orient: Orient;
    sort: "descending" | "ascending" | "none";
    gap: number;
    funnelAlign: Align;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    dimensions: Dimension[];
    encode: unknown;
    data: (Partial<Data> | unknown)[];
    silent: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type LabelLineExtend = {
    length: number;
};

type ChangeableStyle = {
    label: Partial<Label>;
    labelLine: Partial<LabelLine>;
    itemStyle: Partial<SymbolIconStyle>;
};

type Data = Omit<Interactive<ChangeableStyle>, "selectedMode"> & {
    name: string;
    value: number;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    label: Partial<Label & { minMargin: number; }>;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    tooltip: Partial<AxisTooltip>;
};
