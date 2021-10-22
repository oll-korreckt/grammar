import { Point } from "./point";

export type Slope = number | "vertical";

function calc(point1: Point, point2: Point): Slope {
    if (point1.x === point2.x) {
        return "vertical";
    }
    return (point1.y - point2.y) / (point1.x - point2.x);
}

export const Slope = {
    calc: calc
};