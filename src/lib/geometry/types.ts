export type GeometricType =
    | "point"
    | "vector: 2D"
    | "line: vertical"
    | "line: slope-intercept"
    | "segment"
    | "ray"
    | "triangle"
    | "rectangle";

export interface GeometricObject {
    geometricType: GeometricType;
}