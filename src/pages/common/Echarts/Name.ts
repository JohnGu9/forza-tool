import { RichTextStyle } from "./TextStyle";

export type Name = {
    name: string;
    nameLocation: "end" | "start" | "middle" | "center";
    nameTextStyle: Partial<RichTextStyle>;
    nameGap: number;
    nameRotate: number;
    nameTruncate: Partial<NameTruncate>;
};
export type NameTruncate = {
    maxWidth: number;
    ellipsis: string;
};
