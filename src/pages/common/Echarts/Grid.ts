import { Position, Shadow, Size, ZLevel } from "./common";
import { Tooltip } from "./Tooltip";

export type Grid = ZLevel & Position & Size & Shadow & {
    id: string;
    show: boolean;
    containLabel: boolean;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    tooltip: Partial<Tooltip>;
};
