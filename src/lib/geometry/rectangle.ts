import { Point } from ".";
import { GeometricObject } from "./types";
import { Utils } from "./utils";

export interface Rectangle extends GeometricObject {
    geometricType: "rectangle";
    pointA: Point;
    pointB: Point;
    pointC: Point;
    pointD: Point;
}

function _isRightAngle(pointA: Point, pointB: Point, pointC: Point): boolean {
    const angle = Point.angle(pointA, pointB, pointC);
    return Utils.equalTo(angle, 90);
}

function init(pointA: Point, pointB: Point, pointC: Point, pointD: Point): Rectangle {
    if (!_isRightAngle(pointA, pointB, pointC)
        || !_isRightAngle(pointB, pointC, pointD)
        || !_isRightAngle(pointC, pointD, pointA)
        || !_isRightAngle(pointD, pointA, pointB)) {
        throw "points do not form a rectangle";
    }
    return {
        geometricType: "rectangle",
        pointA,
        pointB,
        pointC,
        pointD
    };
}

function width(rect: Rectangle): number {
    const { pointA, pointB } = rect;
    return Point.distance(pointA, pointB);
}

function height(rect: Rectangle): number {
    const { pointA, pointD } = rect;
    return Point.distance(pointA, pointD);
}

function area(rect: Rectangle): number {
    return width(rect) * height(rect);
}

function toPolygon(rect: Rectangle): Point[] {
    const { pointA, pointB, pointC, pointD } = rect;
    return [pointA, pointB, pointC, pointD];
}

export const Rectangle = {
    init: init,
    isRectangle: Utils.createTypeGuard<Rectangle>("rectangle"),
    area: area,
    toPolygon: toPolygon
};