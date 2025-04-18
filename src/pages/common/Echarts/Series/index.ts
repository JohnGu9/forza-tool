
import { Bar } from "./Bar";
import { Boxplot } from "./Boxplot";
import { Candlestick } from "./Candlestick";
import { Custom } from "./Custom";
import { EffectScatter } from "./EffectScatter";
import { Funnel } from "./Funnel";
import { Gauge } from "./Gauge";
import { Graph } from "./Graph";
import { Heatmap } from "./Heatmap";
import { Line } from "./Line";
import { Lines } from "./Lines";
import { SeriesMap } from "./Map";
import { Parallel } from "./Parallel";
import { PictorialBar } from "./PictorialBar";
import { Pie } from "./Pie";
import { Radar } from "./Radar";
import { SanKey } from "./SanKey";
import { Scatter } from "./Scatter";
import { Sunburst } from "./Sunburst";
import { ThemeRiver } from "./ThemeRiver";
import { Tree } from "./Tree";
import { TreeMap } from "./TreeMap";

export type Series = (
    Partial<Line> |
    Partial<Bar> |
    Partial<Pie> |
    Partial<Scatter> |
    Partial<EffectScatter> |
    Partial<Radar> |
    Partial<Tree> |
    Partial<TreeMap> |
    Partial<Sunburst> |
    Partial<Boxplot> |
    Partial<Candlestick> |
    Partial<Heatmap> |
    Partial<SeriesMap> |
    Partial<Parallel> |
    Partial<Lines> |
    Partial<Graph> |
    Partial<SanKey> |
    Partial<Funnel> |
    Partial<Gauge> |
    Partial<PictorialBar> |
    Partial<ThemeRiver> |
    Partial<Custom>
)[];
