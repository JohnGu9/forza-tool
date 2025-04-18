import { AnimationProps, HasSymbol, Orient, Padding, Position, SymbolIcon, SymbolIconStyle, ZLevel } from "./common";
import { LineStyle } from "./LineStyle";
import { RichTextStyle } from "./TextStyle";
import { Tooltip } from "./Tooltip";

export type Timeline = ZLevel & Position & HasSymbol & {
    show: boolean;
    type: "slider";
    axisType: "time" | "value" | "category";
    currentIndex: number;
    autoPlay: boolean;
    rewind: boolean;
    loop: boolean;
    playInterval: number;
    realtime: boolean;
    replaceMerge: string | string[];
    controlPosition: "left" | "right";
    padding: Padding;
    orient: Orient;
    inverse: boolean;
    lineStyle: Partial<LineStyle>;
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
    checkpointStyle: Partial<CheckpointStyle>;
    controlStyle: Partial<ControlStyle>;
    progress: Partial<Progress>;
    emphasis: Partial<Emphasis>;
    data: AxisData;
};

type Label = RichTextStyle & {
    position: "auto" | "left" | "right" | "top" | "bottom" | number;
    show: boolean;
    interval: string | number;
    rotate: number;
    formatter: string | ((value: unknown, index: number) => string);
};

type CheckpointStyle = SymbolIconStyle & HasSymbol & AnimationProps & {
};

type ControlStyle = SymbolIconStyle & {
    show: boolean;
    showPlayBtn: boolean;
    showPrevBtn: boolean;
    showNextBtn: boolean;
    itemSize: number;
    itemGap: number;
    position: "left" | "right" | "top" | "bottom";
    playIcon: SymbolIcon;
    stopIcon: SymbolIcon;
    prevIcon: SymbolIcon;
    nextIcon: SymbolIcon;
};

type Progress = {
    lineStyle: Partial<LineStyle>;
    itemStyle: Partial<SymbolIconStyle>;
    label: Partial<Label>;
};

type Emphasis = {
    label: Partial<Label>;
    itemStyle: Partial<SymbolIconStyle>;
    checkpointStyle: Partial<CheckpointStyle>;
    controlStyle: Partial<ControlStyle>;
};

type AxisData = (string | number |
    HasSymbol & {
        value: string | number;
        tooltip: Partial<Tooltip>;
    })[];
