import { Border, BorderType, NumSize, Padding, Shadow } from "./common";

export type TextStyle = NumSize & Overflow & {
    color: string;
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    textBorderColor: string;
    textBorderWidth: number;
    textBorderType: BorderType;
    textBorderDashOffset: number; /* @Since v5.0.0 */
    textShadowColor: string;
    textShadowBlur: number;
    textShadowOffsetX: number;
    textShadowOffsetY: number;
};

export type Overflow = {
    overflow: "none" | "break" | "breakAll";
} | {
    overflow: "truncate";
    ellipsis: string;
};

export type RichText = {
    rich: { [key: string]: Partial<RichTextStyle>; };
};

export type FontStyle = "normal" | "italic" | "oblique";
export type FontWeight = "normal" | "bold" | "bolder" | "lighter" | number /* 100 | 200 | 300 | 400... */;

export type RichTextStyle = TextStyle & Shadow & Border & {
    align: Align;
    verticalAlign: VerticalAlign;
    backgroundColor: string | { image: string; };
    padding: Padding;
    rich: { [key: string]: Partial<RichTextStyle>; };
};

export type Align = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";
