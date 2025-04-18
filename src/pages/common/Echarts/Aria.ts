import { HasSymbol } from "./common";

export type Aria = {
    enabled: boolean;
    label: Partial<Label>;
    decal: Partial<Decal>;
};

type Label = {
    enabled: boolean;
    description: string;
    general: Partial<General>;
    series: Partial<Series>;
    data: Partial<Data>;
};

type General = {
    withTitle: string;
    withoutTitle: string;
};

type Series = {
    maxCount: number;
    single: Partial<{
        prefix: string;
        withName: string;
        withoutName: string;
    }>;
    multiple: Partial<{
        prefix: string;
        withName: string;
        withoutName: string;
        separator: Partial<Separator>;
    }>;
};

type Data = {
    maxCount: number;
    allData: string;
    partialData: string;
    withName: string;
    withoutName: string;
    excludeDimensionId: unknown[];
    separator: Partial<Separator>;
};

type Separator = {
    middle: string;
    end: string;
};

type Decal = {
    show: boolean;
    decals: Partial<Decals>;
};

type Decals = HasSymbol & {
    color: string;
    backgroundColor: string;
    dashArrayX: number | (number | number[])[];
    dashArrayY: number | (number | number[])[];
    rotation: number;
    maxTileWidth: number;
    maxTileHeight: number;
};

