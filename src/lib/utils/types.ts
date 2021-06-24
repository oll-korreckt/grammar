export type PrimitiveType =
    | "undefined"
    | "object"
    | "boolean"
    | "number"
    | "bigint"
    | "string"
    | "symbol"
    | "function";

export type DistributiveOmit<T, K extends string | number | symbol> = T extends any
    ? Omit<T, K>
    : never;