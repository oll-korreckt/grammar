import { Point } from "./point";
import { Line } from "./line";
import { Bounds } from "./bounds";
import { GeometricObject } from "./types";
import { Utils } from "./utils";
import { Slope } from "./slope";

export interface Segment extends GeometricObject {
    geometricType: "segment";
    point1: Point;
    point2: Point;
}

function init(point1: Point, point2: Point): Segment {
    if (Point.equals(point1, point2)) {
        throw "cannot create a Segment of length 0";
    }
    return { geometricType: "segment", point1, point2 };
}

function slope(seg: Segment): Slope {
    const { point1, point2 } = seg;
    return Slope.calc(point1, point2);
}

function length(seg: Segment): number {
    return Point.distance(
        seg.point1,
        seg.point2
    );
}

function contains(seg: Segment, point: Point): boolean {
    const segLength = Segment.length(seg);
    const dist1 = Point.distance(
        seg.point1,
        point
    );
    const dist2 = Point.distance(
        seg.point2,
        point
    );
    return segLength === dist1 + dist2;
}

function toLine(seg: Segment): Line {
    const { point1 } = seg;
    const segSlope = slope(seg);
    if (segSlope === "vertical") {
        return Line.init(point1.x);
    }
    const intercept = point1.y - segSlope * point1.x;
    return Line.init(segSlope, intercept);
}

function getXBounds(seg: Segment): Bounds {
    const { point1, point2 } = seg;
    return [point1.x, point2.x];
}

function getYBounds(seg: Segment): Bounds {
    const { point1, point2 } = seg;
    return [point1.y, point2.y];
}

function intersect(seg1: Segment, seg2: Segment): Segment | Point | false {
    const seg1Line = toLine(seg1);
    const seg2Line = toLine(seg2);
    const lineIntersectResult = Line.intersect(seg1Line, seg2Line);
    if (lineIntersectResult === "identical") {
        if (Line.isVerticalLine(seg1Line)) {
            const bounds1 = getYBounds(seg1);
            const bounds2 = getYBounds(seg2);
            const overlapResult = Bounds.overlap(bounds1, bounds2);
            if (overlapResult === false) {
                return false;
            }
            const { x } = seg1Line;
            return init(
                Point.init(x, overlapResult[0]),
                Point.init(x, overlapResult[1])
            );
        } else if (Line.isSlopeIntercept(seg1Line)) {
            const bounds1 = getXBounds(seg1);
            const bounds2 = getXBounds(seg2);
            const overlapResult = Bounds.overlap(bounds1, bounds2);
            if (overlapResult === false) {
                return false;
            }
            const [x1, x2] = overlapResult;
            const y1 = Line.calcY(seg1Line, x1);
            const y2 = Line.calcY(seg1Line, x2);
            return init(
                Point.init(x1, y1),
                Point.init(x2, y2)
            );
        }
        throw "unhandled line type";
    } else if (lineIntersectResult === "parallel") {
        return false;
    }
    const pointExists = Segment.contains(seg1, lineIntersectResult)
        && Segment.contains(seg2, lineIntersectResult);
    return pointExists ? lineIntersectResult : false;
}

function dot(point1: Point, point2: Point): number {
    return (point1.x * point2.x) + (point1.y * point2.y);
}

function calcUnitVector(point: Point): Point {
    const { x, y } = point;
    const magnitude = Math.sqrt(x ** 2 + y ** 2);
    return Point.init(
        x / magnitude,
        y / magnitude
    );
}

function pathToPoint(seg: Segment, point: Point): Segment {
    const { point1, point2 } = seg;
    const origin = Point.init(0, 0);
    const shift = Point.subtract(origin, point1);
    const point2Vector = Point.add(point2, shift);
    const point2UnitVector = calcUnitVector(point2Vector);
    const pointVector = Point.add(point, shift);
    const dotScalar = dot(pointVector, point2UnitVector);
    if (dotScalar <= 0) {
        return init(point1, point);
    }
    const segLength = length(seg);
    if (dotScalar >= segLength) {
        return init(point2, point);
    }
    const dotVector = Point.init(
        point2UnitVector.x * dotScalar,
        point2UnitVector.y * dotScalar
    );
    return Segment.init(
        point,
        Point.subtract(dotVector, shift)
    );
}

function collision(seg: Segment, other: Segment | Point): boolean {
    if (Segment.isSegment(other)) {
        const output = intersect(seg, other);
        return typeof output === "object" ? true : output;
    }
    return contains(seg, other);
}

function equals(seg1: Segment, seg2: Segment): boolean {
    return Point.equals(seg1.point1, seg2.point1)
        && Point.equals(seg1.point2, seg2.point2);
}

function move(seg: Segment, xOffset: number, yOffset: number): Segment {
    const { point1, point2 } = seg;
    return Segment.init(
        Point.move(point1, xOffset, yOffset),
        Point.move(point2, xOffset, yOffset)
    );
}

export const Segment = {
    init: init,
    isSegment: Utils.createTypeGuard<Segment>("segment"),
    slope: slope,
    length: length,
    contains: contains,
    intersect: intersect,
    toLine: toLine,
    collision: collision,
    equals: equals,
    pathToPoint: pathToPoint,
    move: move
};