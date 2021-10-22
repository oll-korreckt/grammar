import { GeometricObject } from "./types";
import { Utils } from "./utils";


export interface Point extends GeometricObject {
    geometricType: "point";
    x: number;
    y: number;
}

function init(x: number, y: number): Point {
    return { geometricType: "point", x, y };
}

function equals(point1: Point, point2: Point): boolean {
    return Utils.equalTo(point1.x, point2.x)
        && Utils.equalTo(point1.y, point2.y);
}

function distance(point1: Point, point2: Point): number {
    return Math.sqrt(
        (point2.x - point1.x) ** 2
        + (point2.y - point1.y) ** 2
    );
}

function add(point1: Point, point2: Point): Point {
    return init(
        point1.x + point2.x,
        point1.y + point2.y
    );
}

function subtract(point1: Point, point2: Point): Point {
    return init(
        point1.x - point2.x,
        point1.y - point2.y
    );
}

function angle(pointA: Point, pointB: Point, pointC: Point): number {
    const sideA = distance(pointB, pointC);
    const sideB = distance(pointA, pointC);
    const sideC = distance(pointA, pointB);
    const numerator = sideB ** 2 - sideA ** 2 - sideC ** 2;
    const denominator = -2 * sideA * sideC;
    const outputRadians = Math.acos(numerator / denominator);
    return outputRadians * 180 / Math.PI;
}

function move(point: Point, xOffset: number, yOffset: number): Point {
    return Point.init(point.x + xOffset, point.y + yOffset);
}

export const Point = {
    init: init,
    isPoint: Utils.createTypeGuard<Point>("point"),
    equals: equals,
    distance: distance,
    add: add,
    subtract: subtract,
    angle: angle,
    move: move
};