import { Border, Padding, Position, Shadow, ZLevel } from "./common";
import { Align, RichText, TextStyle, VerticalAlign } from "./TextStyle";

export type Title = Position & ZLevel & Shadow & Border & {
    id: string;
    show: boolean;
    text: string;
    link: string;
    target: Target;
    textStyle: Partial<TextStyle & RichText>;
    subtext: string;
    sublink: string;
    subtarget: Target;
    subtextStyle: Partial<SubtextStyle>;
    textAlign: "auto" | "top" | "bottom" | "middle";
    triggerEvent: boolean;
    padding: Padding;
    itemGap: number;
    backgroundColor: string;
};

export type Target = "blank" | "self";

export type SubtextStyle = TextStyle & RichText & {
    align: Align;
    verticalAlign: VerticalAlign;
};
