import { Property } from "csstype";

import { Focusable, NumSize, Position, SimplePosition, ZLevel } from "./common";
import { BasicElementStyle, GroupElementTransformProps, TransitionAnimationMixin } from "./Series/Custom";
import { Align, Overflow, VerticalAlign } from "./TextStyle";

export type Graphic = {
    id: string;
    elements: Element[];
};

export type Element =
    GroupElement |
    ImageElement |
    TextElement |
    RectElement |
    CircleElement |
    RingElement |
    SectorElement |
    ArcElement |
    PolygonElement |
    PolylineElement |
    LineElement |
    BezierCurveElement;

export type TextConfig = {
    position: SimplePosition;
    rotation: number;
    layoutRect: Partial<{ x: number; y: number; width: number; height: number; }>;
    offset: [string | number, string | number];
    origin: [string | number, string | number];
    distance: number;
    local: boolean;
    insideFill: string;
    insideStroke: string;
    outsideFill: string;
    outsideStroke: string;
    inside: boolean;
};

type Callbacks = {
    onclick: () => unknown;
    onmouseover: () => unknown;
    onmouseout: () => unknown;
    onmousemove: () => unknown;
    onmousewheel: () => unknown;
    onmousedown: () => unknown;
    onmouseup: () => unknown;
    ondrag: () => unknown;
    ondragstart: () => unknown;
    ondragend: () => unknown;
    ondragenter: () => unknown;
    ondragleave: () => unknown;
    ondragover: () => unknown;
    ondrop: () => unknown;
};

type BasicElement = Focusable & {
    id: string;
    $action: "merge" | "replace" | "remove";
    bounding: "all" | "raw";
    info: unknown;
    silent: boolean;
    invisible: boolean;
    ignore: boolean;
    textContent: Partial<TextElement>;
    textConfig: Partial<TextConfig>;
    cursor: Property.Cursor;
    draggable: boolean | "horizontal" | "vertical";
    progressive: boolean;
};

export type GroupElement = GroupElementTransformProps & TransitionAnimationMixin<GroupElementTransformProps> & Position & ZLevel & NumSize & Callbacks & {
    type: "group";
    id: string;
    $action: "merge" | "replace" | "remove";
    bounding: "all" | "raw";
    info: unknown;
    silent: boolean;
    ignore: boolean;
    textContent: Partial<TextElement>;
    textConfig: Partial<TextConfig>;
    draggable: boolean | "horizontal" | "vertical";
    diffChildrenByName: boolean;
    children: unknown[];
};

export type ImageElement = BasicElement & ImageElementTransformProp & TransitionAnimationMixin<ImageElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "image";
};

export type ImageElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    style: Partial<ImageElementStyle>;
};

type ImageElementStyle = BasicElementStyle & NumSize & {
    image: string;
    x: number;
    y: number;
};

export type TextElement = TextElementTransformProp & TransitionAnimationMixin<TextElementTransformProp> & Position & ZLevel & Callbacks & Focusable & {
    type: "text";
    id: string;
    $action: "merge" | "replace" | "remove";
    bounding: "all" | "raw";
    info: unknown;
    silent: boolean;
    invisible: boolean;
    ignore: boolean;
    textContent: Partial<TextElement>;
    textConfig: Partial<TextConfig>;
    cursor: Property.Cursor;
    draggable: boolean | "horizontal" | "vertical";
    progressive: boolean;
};

export type TextElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    style: Partial<TextElementStyle>;
};

type TextElementStyle = BasicElementStyle & Overflow & {
    text: string;
    x: number;
    y: number;
    font: string;
    textAlign: Align;
    width: number;
    textVerticalAlign: VerticalAlign;
};

export type RectElement = BasicElement & RectElementTransformProp & TransitionAnimationMixin<RectElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "rect";
};

export type RectElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<RectElementShape>;
    style: Partial<RectElementStyle>;
};

type RectElementShape = NumSize & {
    x: number;
    y: number;
    r: number | [number] | [number, number] | [number, number, number] | [number, number, number, number];
    transition: string | string[];
};

type RectElementStyle = BasicElementStyle & {
};

export type CircleElement = BasicElement & CircleElementTransformProp & TransitionAnimationMixin<CircleElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "circle";
};

export type CircleElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<CircleElementShape>;
    style: Partial<CircleElementStyle>;
};

type CircleElementShape = {
    cx: number;
    cy: number;
    r: number;
    transition: string | string[];
};

type CircleElementStyle = BasicElementStyle & {
};

export type RingElement = BasicElement & RingElementTransformProp & TransitionAnimationMixin<RingElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "ring";
};

export type RingElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<RingElementShape>;
    style: Partial<RingElementStyle>;
};

type RingElementShape = {
    cx: number;
    cy: number;
    r: number;
    r0: number;
    transition: string | string[];
};

type RingElementStyle = BasicElementStyle & {
};

export type SectorElement = BasicElement & SectorElementTransformProp & TransitionAnimationMixin<SectorElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "sector";
};

export type SectorElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<SectorElementShape>;
    style: Partial<SectorElementStyle>;
};

type SectorElementShape = {
    cx: number;
    cy: number;
    r: number;
    r0: number;
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
    transition: string | string[];
};

type SectorElementStyle = BasicElementStyle & {
};


export type ArcElement = BasicElement & ArcElementTransformProp & TransitionAnimationMixin<ArcElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "arc";
};

export type ArcElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<ArcElementShape>;
    style: Partial<ArcElementStyle>;
};

type ArcElementShape = {
    cx: number;
    cy: number;
    r: number;
    r0: number;
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
    transition: string | string[];
};

type ArcElementStyle = BasicElementStyle & {
};

export type PolygonElement = BasicElement & PolygonElementTransformProp & TransitionAnimationMixin<PolygonElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "polygon";
};

export type PolygonElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<PolygonElementShape>;
    style: Partial<PolygonElementStyle>;
};

type PolygonElementShape = {
    points: [number, number][];
    smooth: number | "spline";
    smoothConstraint: boolean;
    transition: string | string[];
};

type PolygonElementStyle = BasicElementStyle & {
};

export type PolylineElement = BasicElement & PolylineElementTransformProp & TransitionAnimationMixin<PolylineElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "polyline";
};

export type PolylineElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<PolylineElementShape>;
    style: Partial<PolylineElementStyle>;
};

type PolylineElementShape = {
    points: [number, number][];
    smooth: number | "spline";
    smoothConstraint: boolean;
    transition: string | string[];
};

type PolylineElementStyle = BasicElementStyle & {
};

export type LineElement = BasicElement & LineElementTransformProp & TransitionAnimationMixin<LineElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "line";
};

export type LineElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<LineElementShape>;
    style: Partial<LineElementStyle>;
};

type LineElementShape = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    percent: number;
    transition: string | string[];
};

type LineElementStyle = BasicElementStyle & {
};

export type BezierCurveElement = BasicElement & BezierCurveElementTransformProp & TransitionAnimationMixin<BezierCurveElementTransformProp> & Position & ZLevel & Callbacks & {
    type: "bezierCurve";
};

export type BezierCurveElementTransformProp = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
    shape: Partial<BezierCurveElementShape>;
    style: Partial<BezierCurveElementStyle>;
};

type BezierCurveElementShape = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    cpx1: number;
    cpy1: number;
    cpx2: number;
    cpy2: number;
    percent: number;
    transition: string | string[];
};

type BezierCurveElementStyle = BasicElementStyle & {
};
