import { Point } from "./point";
import { GeometricObject } from "./types";

export interface Triangle extends GeometricObject {
    geometricType: "triangle";
    pointA: Point;
    pointB: Point;
    pointC: Point;
}

function init(pointA: Point, pointB: Point, pointC: Point): Triangle {
    return {
        geometricType: "triangle",
        pointA,
        pointB,
        pointC
    };
}

function area(tri: Triangle): number {
    const { pointA, pointB, pointC } = tri;
    const term1 = pointA.x * (pointB.y - pointC.y);
    const term2 = pointB.x * (pointC.y - pointA.y);
    const term3 = pointC.x * (pointA.y - pointB.y);
    return Math.abs(term1 + term2 + term3) / 2;
}

function toPolygon(tri: Triangle): Point[] {
    const { pointA, pointB, pointC } = tri;
    return [pointA, pointB, pointC];
}

export const Triangle = {
    init: init,
    area: area,
    toPolygon: toPolygon
};