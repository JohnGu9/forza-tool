import { AxisTooltip } from "../Axis";
import { AnimationEasing, BorderType, Cap, Decal, Focusable, Join, NumSize, Shadow, SymbolIconStyle } from "../common";
import { Dimension } from "../Dataset";
import { TextConfig, TextElement } from "../Graphic";
import { Align, Overflow, VerticalAlign } from "../TextStyle";
import { BasicSeries, CalendarCoordinateSystem, Cartesian2dCoordinateSystem, GeoCoordinateSystem, LabelLayout, LabelLine, PolarCoordinateSystem, SelectedMode, SeriesLayoutBy, SingleCoordinateSystem, UniversalTransition } from "./common";

type CoordinateSystem = Cartesian2dCoordinateSystem | PolarCoordinateSystem | GeoCoordinateSystem | CalendarCoordinateSystem | SingleCoordinateSystem;

export type Custom = BasicSeries & CoordinateSystem & {
    type: "custom";
    renderItem: RenderItem;
    labelLine: Partial<LabelLine & LabelLineExtend>;
    labelLayout: Partial<LabelLayout>;
    selectedMode: SelectedMode;
    dimensions: Dimension[];
    encode: unknown;
    seriesLayoutBy: SeriesLayoutBy;
    datasetIndex: number;
    dataGroupId: string;
    data: (Partial<Data> | unknown)[];
    clip: boolean;
    universalTransition: Partial<UniversalTransition>;
};

type LabelLineExtend = {
    showAbove: boolean;
    length2: number;
    smooth: boolean | number;
    minTurnAngle: number;
};

type Data = {
    name: string;
    value: number;
    groupId: string;
    childGroupId: string;
    itemStyle: Partial<SymbolIconStyle & { decal: Partial<Decal>; }>;
    emphasis: Partial<{ itemStyle: Partial<SymbolIconStyle>; }>;
    tooltip: Partial<AxisTooltip>;
};

type RenderItem = (params: RenderItemParams, api: RenderItemApi) => RenderItemReturn;

type RenderItemParams = {
    context: string; // {string} An object that developers can store something temporarily here. Life cycle: current round of rendering.
    seriesId: string; // {string} The id of this series.
    seriesName: string;// {string} The name of this series.
    seriesIndex: number; // {number} The index of this series.
    dataIndex: number; // {number} The index of this data item.
    dataIndexInside: number;  // {number} The index of this data item in the current data window (see dataZoom).
    dataInsideLength: number; // {number} The count of data in the current data window (see dataZoom).
    actionType: string;// {string} The type of action that trigger this render.
    coordSys: {
        type: 'cartesian2d';
        x: number;// {number} x of grid rect
        y: number;// {number} y of grid rect
        width: number;// {number} width of grid rect
        height: number;// {number} height of grid rect
    } |// coordSys is variable by different types of coordinate systems:
    {
        type: 'calendar',
        x: number;// {number} x of calendar rect
        y: number;// {number} y of calendar rect
        width: number;// {number} width of calendar rect
        height: number;// {number} height of calendar rect
        cellWidth: number;// {number} calendar cellWidth
        cellHeight: number;// {number} calendar cellHeight
        rangeInfo: {
            start: unknown;// date start of calendar.
            end: unknown;// date end of calendar.
            weeks: number; // number of weeks in calendar.
            dayCount: number;// day count in calendar.
        };
    } |
    {
        type: 'geo',
        x: number;// {number} x of geo rect
        y: number;// {number} y of geo rect
        width: number;// {number} width of geo rect
        height: number;// {number} height of geo rect
        zoom: number; // {number} zoom ratio, 1 if no zoom, 0.5 means shrink to 50%.
    } |
    {
        type: 'polar',
        cx: number;// {number} x of polar center.
        cy: number;// {number} y of polar center.
        r: number;// {number} outer radius of polar.
        r0: number;// {number} inner radius of polar.
    } |
    {
        type: 'singleAxis',
        x: number;// {number} x of singleAxis rect
        y: number;// {number} y of singleAxis rect
        width: number;// {number} width of singleAxis rect
        height: number;// {number} height of singleAxis rect
    };
};

type RenderItemApi = {
    value: (dimension: number, dataIndexInside: number) => number;
    coord: (data: number[]) => number[];
    size: (dataSize: number[], dataItem: number[]) => number[];
    style: (extra: unknown, dataIndexInside: number) => unknown;
    styleEmphasis: (extra: unknown, dataIndexInside: number) => unknown;
    visual: (visualType: string, dataIndexInside: number) => string | number;
    barLayout: (opt: { count: number, barWidth: number | string, barMaxWidth: number | string, barMinWidth: number | string, barGap: number, barCategoryGap: number; }) => { width: number; offset: number; offsetCenter: number; }[];
    currentSeriesIndices: () => number;
    font: (opt: { fontStyle: string, fontWeight: number; fontSize: number; fontFamily: string; }) => string;
    getWidth: () => number;
    getHeight: () => number;
    getZr: () => unknown;
    getDevicePixelRatio: () => number;
};

type RenderItemReturn =
    Partial<RenderItemReturnGroup> |
    Partial<RenderItemReturnPath> |
    Partial<RenderItemReturnImage> |
    Partial<RenderItemReturnText> |
    Partial<RenderItemReturnRect> |
    Partial<RenderItemReturnCircle> |
    Partial<RenderItemReturnRing> |
    Partial<RenderItemReturnSector> |
    Partial<RenderItemReturnArc> |
    Partial<RenderItemReturnPolygon> |
    Partial<RenderItemReturnPolyline> |
    Partial<RenderItemReturnLine> |
    Partial<RenderItemReturnBezierCurve>;

interface CustomDuringAPI<TransformProp> {
    // Set transform prop value.
    // Transform prop see `TransformProp`.
    setTransform(key: TransformProp, val: unknown): void;
    // Get transform prop value of the current animation frame.
    getTransform(key: TransformProp): unknown;
    // Set shape prop value.
    // Shape prop is like `{ type: 'rect', shape: { xxxProp: xxxValue } }`.
    setShape(key: string, val: unknown): void;
    // Get shape prop value of the current animation frame.
    getShape(key: string): unknown;
    // Set style prop value.
    // Style prop is like `{ type: 'rect', style: { xxxProp: xxxValue } }`.
    setStyle(key: string, val: unknown): void;
    // Get style prop value of the current animation frame.
    getStyle(key: string): unknown;
    // Set extra prop value.
    // Extra prop is like `{ type: 'rect', extra: { xxxProp: xxxValue } }`.
    setExtra(key: string, val: unknown): void;
    // Get extra prop value of the current animation frame.
    getExtra(key: string): unknown;
}

type KeyframeAnimation<T> = Animation & {
    loop: boolean;
    keyframes: ({ percent: number; easing?: number; } & Partial<T>)[];
};

type Animation = {
    duration: number;
    easing: AnimationEasing;
    delay: number;
};

export type TransitionAnimationMixin<TransformProp> = {
    transition: "shape" | "style" | "extra" | keyof TransformProp[];
    enterFrom: Partial<TransformProp>;
    leaveTo: Partial<TransformProp>;
    enterAnimation: Partial<Animation>;
    updateAnimation: Partial<Animation>;
    leaveAnimation: Partial<Animation>;
    keyframeAnimation: Partial<KeyframeAnimation<TransformProp>> | Partial<KeyframeAnimation<TransformProp>>[];
    during: (api: CustomDuringAPI<keyof TransformProp>) => void;
};

export type BasicElementStyle = Shadow & {
    fill: string;
    stroke: string;
    lineWidth: number;
    lineDash: BorderType;
    lineDashOffset: number;
    lineCap: Cap;
    lineJoin: Join;
    miterLimit: number;
    opacity: number;
    transition: string | string[];
};

type RenderItemReturnBasic = {
    id: string;
    name: string;
    z2: number;
    info: unknown;
    silent: boolean;
    ignore: boolean;
    textContent: Partial<TextElement>;
    textConfig: Partial<TextConfig>;
    extra: Partial<{ transition: string | string[]; }>;
};

type ElementTransformPropsBasic = {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    originX: number;
    originY: number;
};

export type RenderItemReturnGroup = RenderItemReturnBasic & ElementTransformPropsBasic & TransitionAnimationMixin<ElementTransformPropsBasic> & NumSize & {
    type: "group";
    diffChildrenByName: boolean;
    children: unknown[];
};

type Emphasizeable = {
    emphasisDisabled: boolean;
    emphasis: Partial<BasicElementStyle>;
    blur: Partial<BasicElementStyle>;
    select: Partial<BasicElementStyle>;
};

export type RenderItemReturnPath = RenderItemReturnBasic & PathElementTransformProps & TransitionAnimationMixin<PathElementTransformProps> & Focusable & Emphasizeable & {
    type: "path";
    morph: boolean;
    invisible: boolean;
};
export type PathElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<PathElementShape>;
};
export type PathElementShape = NumSize & {
    pathData: string;
    d: string;
    layout: "center" | "cover";
    x: number;
    y: number;
    transition: string | string[];
};

export type RenderItemReturnImage = RenderItemReturnBasic & ImageElementTransformProps & TransitionAnimationMixin<ImageElementTransformProps> & Focusable & Emphasizeable & {
    type: "image";
    invisible: boolean;
};
export type ImageElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<ImageElementStyle>;
};
export type ImageElementStyle = BasicElementStyle & NumSize & {
    image: string;
    x: number;
    y: number;
};

export type RenderItemReturnText = RenderItemReturnBasic & TextElementTransformProps & TransitionAnimationMixin<TextElementTransformProps> & Focusable & Emphasizeable & {
    type: "text";
    invisible: boolean;
};
export type TextElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<TextElementStyle>;
};
export type TextElementStyle = BasicElementStyle & Overflow & {
    text: string;
    x: number;
    y: number;
    font: string;
    textAlign: Align;
    textVerticalAlign: VerticalAlign;
    width: number;
};

export type RenderItemReturnRect = RenderItemReturnBasic & RectElementTransformProps & TransitionAnimationMixin<RectElementTransformProps> & Focusable & Emphasizeable & {
    type: "rect";
    morph: boolean;
    invisible: boolean;
};
export type RectElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<RectElementShape>;
};
export type RectElementShape = NumSize & {
    x: number;
    y: number;
    r: number | [number] | [number, number] | [number, number, number] | [number, number, number, number];
    transition: string | string[];
};

export type RenderItemReturnCircle = RenderItemReturnBasic & CircleElementTransformProps & TransitionAnimationMixin<CircleElementTransformProps> & Focusable & Emphasizeable & {
    type: "circle";
    morph: boolean;
    invisible: boolean;
};
export type CircleElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<CircleElementShape>;
};
export type CircleElementShape = NumSize & {
    cx: number;
    cy: number;
    r: number;
    transition: string | string[];
};

export type RenderItemReturnRing = RenderItemReturnBasic & RingElementTransformProps & TransitionAnimationMixin<RingElementTransformProps> & Focusable & Emphasizeable & {
    type: "ring";
    morph: boolean;
    invisible: boolean;
};
export type RingElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<RingElementShape>;
};
export type RingElementShape = NumSize & {
    cx: number;
    cy: number;
    r: number;
    r0: number;
    transition: string | string[];
};

export type RenderItemReturnSector = RenderItemReturnBasic & SectorElementTransformProps & TransitionAnimationMixin<SectorElementTransformProps> & Focusable & Emphasizeable & {
    type: "sector";
    morph: boolean;
    invisible: boolean;
};
export type SectorElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<SectorElementShape>;
};
export type SectorElementShape = NumSize & {
    cx: number;
    cy: number;
    r: number;
    r0: number;
    transition: string | string[];
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
};

export type RenderItemReturnArc = RenderItemReturnBasic & ArcElementTransformProps & TransitionAnimationMixin<ArcElementTransformProps> & Focusable & Emphasizeable & {
    type: "arc";
    morph: boolean;
    invisible: boolean;
};
export type ArcElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<ArcElementShape>;
};
export type ArcElementShape = NumSize & {
    cx: number;
    cy: number;
    r: number;
    r0: number;
    transition: string | string[];
    startAngle: number;
    endAngle: number;
    clockwise: boolean;
};

export type RenderItemReturnPolygon = RenderItemReturnBasic & PolygonElementTransformProps & TransitionAnimationMixin<PolygonElementTransformProps> & Focusable & Emphasizeable & {
    type: "polygon";
    morph: boolean;
    invisible: boolean;
};
export type PolygonElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<ArcElementShape>;
};
export type PolygonElementShape = NumSize & {
    points: [number, number][];
    smooth: number | "spline";
    smoothConstraint: boolean;
    transition: string | string[];
};

export type RenderItemReturnPolyline = RenderItemReturnBasic & PolygonElementTransformProps & TransitionAnimationMixin<PolygonElementTransformProps> & Focusable & Emphasizeable & {
    type: "polyline";
    morph: boolean;
    invisible: boolean;
};
export type PolylineElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<PolylineElementShape>;
};
export type PolylineElementShape = NumSize & {
    points: [number, number][];
    smooth: number | "spline";
    smoothConstraint: boolean;
    transition: string | string[];
};

export type RenderItemReturnLine = RenderItemReturnBasic & LineElementTransformProps & TransitionAnimationMixin<LineElementTransformProps> & Focusable & Emphasizeable & {
    type: "line";
    morph: boolean;
    invisible: boolean;
};
export type LineElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<LineElementShape>;
};
export type LineElementShape = NumSize & {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    percent: number;
    transition: string | string[];
};

export type RenderItemReturnBezierCurve = RenderItemReturnBasic & BezierCurveElementTransformProps & TransitionAnimationMixin<BezierCurveElementTransformProps> & Focusable & Emphasizeable & {
    type: "bezierCurve";
    morph: boolean;
    invisible: boolean;
};
export type BezierCurveElementTransformProps = ElementTransformPropsBasic & {
    style: Partial<BasicElementStyle>;
    shape: Partial<BezierCurveElementShape>;
};
export type BezierCurveElementShape = NumSize & {
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
