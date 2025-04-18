export type Dataset = {
    id: string;
    source: (unknown[])[] | { [key: string]: unknown[]; };
    dimensions: Dimension[];
    sourceHeader: boolean | number;
    transform: Transform[];
    fromDatasetIndex: number;
    fromDatasetId: string;
    fromTransformResult: number;
};

export type Dimension = string | null | Partial<{
    name: string;
    type: "number" | "float" | "int" | "ordinal" | "time";
    displayName: string;
}>;


type Transform = Partial<FilterTransform> | Partial<SortTransform> | Partial<XxxTransform>;

type FilterTransform = {
    type: "filter";
    config: unknown;
    print: boolean;
};
type SortTransform = {
    type: "sort";
    config: unknown;
    print: boolean;
};
type XxxTransform = {
    type: "xxx:xxx";
    config: unknown;
    print: boolean;
};
