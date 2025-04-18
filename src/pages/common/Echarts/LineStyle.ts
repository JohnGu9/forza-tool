import { BorderType, Cap, Join, Shadow } from "./common";

export type LineStyle = Shadow & {
    color: string;
    width: number;
    type: BorderType;
    dashOffset: number;
    cap: Cap;
    join: Join;
    miterLimit: number;
    opacity: number;
};
