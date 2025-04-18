import { Orient, Position, Size, ZLevel } from "./common";
import { ParallelAxis } from "./ParallelAxis";

export type Parallel = ZLevel & Position & Size & {
    id: string;
    layout: Orient;
    axisExpandable: boolean;
    axisExpandCenter: number;
    axisExpandCount: number;
    axisExpandWidth: number;
    axisExpandTriggerOn: "click" | "mousemove";
    parallelAxisDefault: Partial<ParallelAxis>;
};
