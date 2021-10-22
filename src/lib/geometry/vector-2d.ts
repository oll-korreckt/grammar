import { GeometricObject } from "./types";

export interface Vector2D extends GeometricObject {
    geometricType: "vector: 2D";
    x: number;
    y: number;
}

function init(x: number, y: number): Vector2D {
    return { geometricType: "vector: 2D", x, y };
}

function length(vec: Vector2D): number {
    const { x, y } = vec;
    return Math.sqrt(x ** 2 + y ** 2);
}

function normalize(vec: Vector2D): Vector2D {
    const vecLength = length(vec);
    if (vecLength === 0) {
        throw "cannot normalize a zero vector";
    }
    const { x, y } = vec;
    return init(x / vecLength, y / vecLength);
}

function normal(vec: Vector2D): Vector2D {
    const { x, y } = vec;
    return init(y, x * -1);
}

function add(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return init(
        vec1.x + vec2.x,
        vec1.y + vec2.y
    );
}

function subtract(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return init(
        vec1.x - vec2.x,
        vec1.y - vec2.y
    );
}

function dot(vec1: Vector2D, vec2: Vector2D): number {
    return (vec1.x * vec2.x) + (vec1.y * vec2.y);
}

export const Vector2D = {
    init: init,
    length: length,
    normalize: normalize,
    normal,
    add: add,
    subtract: subtract,
    dot: dot
};