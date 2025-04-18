export type Position = {
    left: "auto" | "center" | "right" | string | number;
    top: "top" | "middle" | "bottom" | string | number;
    right: string | number;
    bottom: string | number;
};

export type Size = {
    width: string | number;
    height: string | number;
};

export type NumSize = {
    width: number;
    height: number;
};

export type PolarPosition = {
    center: [number | string, number | string];
    radius: number | string | [number | string, number | string];
};

export type ZLevel = {
    zlevel: number;
    z: number;
};

export type Padding = number | [number, number] | [number, number, number, number];

export type Shadow = {
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: string;
    shadowOffsetY: string;
};

export type BorderType = "solid" | "dashed" | [number, number] /* @Since v5.0.0 dashed */ | "dotted";
export type Border = {
    borderColor: string;
    borderWidth: number;
    borderType: BorderType;
    borderDashOffset: number;
    borderRadius: number | [number, number, number, number];
};

export type Cap = "butt" | "round" | "square";
export type Join = "bevel" | "round" | "miter";

export type EasingFunc = (percent: number) => number;
export type AnimationEasing = keyof EasingFuncs | EasingFunc;
type EasingFuncs = {
    linear(k: number): number;
    quadraticIn(k: number): number;
    quadraticOut(k: number): number;
    quadraticInOut(k: number): number;
    cubicIn(k: number): number;
    cubicOut(k: number): number;
    cubicInOut(k: number): number;
    quarticIn(k: number): number;
    quarticOut(k: number): number;
    quarticInOut(k: number): number;
    quinticIn(k: number): number;
    quinticOut(k: number): number;
    quinticInOut(k: number): number;
    sinusoidalIn(k: number): number;
    sinusoidalOut(k: number): number;
    sinusoidalInOut(k: number): number;
    exponentialIn(k: number): number;
    exponentialOut(k: number): number;
    exponentialInOut(k: number): number;
    circularIn(k: number): number;
    circularOut(k: number): number;
    circularInOut(k: number): number;
    elasticIn(k: number): number;
    elasticOut(k: number): number;
    elasticInOut(k: number): number;
    backIn(k: number): number;
    backOut(k: number): number;
    backInOut(k: number): number;
    bounceIn(k: number): number;
    bounceOut(k: number): number;
    bounceInOut(k: number): number;
};

export type AnimationProps = {
    animation: boolean;
    animationThreshold: number;
    animationDuration: number | ((index: number) => number);
    animationEasing: AnimationEasing;
    animationDelay: number | ((index: number) => number);
    animationDurationUpdate: number | ((index: number) => number);
    animationEasingUpdate: AnimationEasing;
    animationDelayUpdate: number | ((index: number) => number);
};

export type FormatterParams = {
    componentType: 'series',
    // Series type
    seriesType: string,
    // Series index in option.series
    seriesIndex: number,
    // Series name
    seriesName: string,
    // Data name, or category name
    name: string,
    // Data index in input data array
    dataIndex: number,
    // Original data as input
    data: unknown,
    // Value of data. In most series it is the same as data.
    // But in some series it is some part of the data (e.g., in map, radar)
    value: number | unknown[] | unknown,
    // encoding info of coordinate system
    // Key: coord, like ('x' 'y' 'radius' 'angle')
    // value: Must be an array, not null/undefined. Contain dimension indices, like:
    // {
    //     x: [2] // values on dimension index 2 are mapped to x axis.
    //     y: [0] // values on dimension index 0 are mapped to y axis.
    // }
    encode: unknown,
    // dimension names list
    dimensionNames: string[],
    // data dimension index, for example 0 or 1 or 2 ...
    // Only work in `radar` series.
    dimensionIndex: number,
    // Color of data
    color: string;
};

export type FormatterCallback = (params: FormatterParams | FormatterParams[]) => string;

export type SymbolIcon = "emptyCircle" | "circle" | "rect" | "roundRect" | "triangle" | "diamond" | "pin" | "arrow" | "none" | string;

export type SymbolIconStyle = Shadow & Border & {
    color: string;
    borderCap: Cap;
    borderJoin: Join;
    borderMiterLimit: number;
    opacity: number;
};

export type HasSymbol = {
    symbol: SymbolIcon;
    symbolSize: number;
    symbolRotate: number;
    symbolKeepAspect: boolean;
    symbolOffset: [number | string, number | string];
};

export type Orient = "vertical" | "horizontal";

export type Roam = boolean | "scale" | "move";

export type Decal = HasSymbol & {
    color: string;
    backgroundColor: string;
    dashArrayX: number | number[] | (number | number[])[];
    dashArrayY: number | number[];
    rotation: number;
    maxTileWidth: number;
    maxTileHeight: number;
};

export type Projection = {
    project: (coord: [number, number]) => [number, number];
    unproject: (point: [number, number]) => [number, number];
    stream: unknown;
};

export type ScaleLimit = {
    min: number;
    max: number;
};

export type SimplePosition =
    "top" | "left" | "right" | "bottom" | "inside" | "insideLeft" | "insideRight" | "insideTop" | "insideBottom" | "insideTopLeft" | "insideBottomLeft" | "insideTopRight" | "insideBottomRight" |
    "start" | "insideStart" | "middle" | "insideEnd" | "end" | // @Since: v5.2.0
    [number | string, number | string];

export type Focus = "none" | "self" | "series";

export type BlurScope = "coordinateSystem" | "series" | "global";

export type Focusable = {
    focus: Focus;
    blurScope: BlurScope;
};
