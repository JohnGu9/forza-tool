import { AxisTooltip } from "./Axis";
import { PolarPosition, ZLevel } from "./common";
import { TooltipTrigger } from "./Tooltip";

export type Polar = PolarPosition & ZLevel & {
    id: string;
    tooltip: Partial<AxisTooltip & { trigger: TooltipTrigger; }>;
};

