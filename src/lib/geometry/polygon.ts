import { Point } from ".";
import { Line } from "./line";
import { Ray } from "./ray";
import { Segment } from "./segment";
import { Vector2D } from "./vector-2d";

function _extractPoints(obj: Point[] | Segment): Point[] {
    if (Array.isArray(obj)) {
        if (obj.length < 3) {
            throw "polygons must contain at least 3 points";
        }
        return obj;
    }
    const { point1, point2 } = obj;
    return [point1, point2];
}

function collision(object1: Point[] | Segment, object2: Point[] | Segment): boolean {
    const pointSet1 = _extractPoints(object1);
    const pointSet2 = _extractPoints(object2);
    const collision1 = _collision(pointSet1, pointSet2);
    if (!collision1) {
        return collision1;
    }
    return _collision(pointSet2, pointSet1);
}

function _collision(polygon1: Point[], polygon2: Point[]): boolean {
    for (let index = 0; index < polygon1.length - 1; index++) {
        const pt_iA = polygon1[index];
        const vec_iA = Vector2D.init(pt_iA.x, pt_iA.y);
        const pt_iB = polygon1[index + 1];
        const vec_iB = Vector2D.init(pt_iB.x, pt_iB.y);
        const side_i = Vector2D.subtract(vec_iA, vec_iB);
        const axis =  Vector2D.normalize(Vector2D.normal(side_i));
        const projection1 = project(polygon1, axis);
        const projection2 = project(polygon2, axis);
        if (!overlap(projection1, projection2)) {
            return false;
        }
    }
    return true;
}

function project(polygon: Point[], axis: Vector2D): [min: number, max: number] {
    let minOutput = getProjection(polygon[0], axis);
    let maxOutput= minOutput;
    for (let index = 1; index < polygon.length; index++) {
        const point = polygon[index];
        const projection = getProjection(point, axis);
        if (projection < minOutput) {
            minOutput = projection;
        }
        if (projection > maxOutput) {
            maxOutput = projection;
        }
    }
    return [minOutput, maxOutput];
}

function getProjection(point: Point, axis: Vector2D): number {
    const vector = Vector2D.init(point.x, point.y);
    return Vector2D.dot(vector, axis);
}

function overlap(bounds1: [min: number, max: number], bounds2: [min: number, max: number]): boolean {
    const [b1Min, b1Max] = bounds1;
    const [b2Min, b2Max] = bounds2;
    return b1Max >= b2Min && b2Max >= b1Min;
}

function pathToPoint(polygon: Point[], point: Point): Segment {
    let output: Segment | undefined = undefined;
    let outputLength: number | undefined = undefined;
    for (let index = 0; index < polygon.length - 1; index++) {
        const pointA = polygon[index];
        const pointB = polygon[index + 1];
        const segment = Segment.init(pointA, pointB);
        const path = Segment.pathToPoint(segment, point);
        const pathLength = Segment.length(path);
        if (outputLength === undefined
            || pathLength < outputLength) {
            output = path;
            outputLength = pathLength;
        }
    }
    if (output === undefined) {
        throw "no path found";
    }
    return output;
}

function pathToPolygon(polygon1: Point[], polygon2: Point[]): Segment {
    const output1 = _pathToPolygon(polygon1, polygon2);
    const output2 = _pathToPolygon(polygon2, polygon1);
    return Segment.length(output1) < Segment.length(output2)
        ? output1
        : output2;
}

function _pathToPolygon(polygon1: Point[], polygon2: Point[]): Segment {
    let output: Segment | undefined = undefined;
    let outputLength: number | undefined = undefined;
    for (let index = 0; index < polygon2.length; index++) {
        const point = polygon2[index];
        const path = pathToPoint(polygon1, point);
        const pathLength = Segment.length(path);
        if (outputLength === undefined
            || pathLength < outputLength) {
            output = path;
            outputLength = pathLength;
        }
    }
    if (output === undefined) {
        throw "no path found";
    }
    return output;
}

function containsPoint(polygon: Point[], point: Point): boolean {
    const ray = Ray.init(
        point,
        Point.add(
            point,
            Point.init(1, 1)
        )
    );
    let count = 0;
    for (let index = 0; index < polygon.length - 1; index++) {
        const pointA = polygon[index];
        const pointB = polygon[index + 1];
        const segment = Segment.init(pointA, pointB);
        if (Ray.collision(ray, segment)) {
            count++;
        }
    }
    return count % 2 !== 0;
}

function move(polygon: Point[], x: number, y: number): Point[] {
    const offset = Point.init(x, y);
    return polygon.map((point) => Point.add(point, offset));
}

function scale(polygon: Point[], offset: number): Point[] {
    const normalizer = getNormalizer(polygon);
    const newSides: Line[] = [];
    for (let index1 = 0; index1 < polygon.length; index1++) {
        const pointA = polygon[index1];
        const index2 = overflowIndex(index1 + 1, polygon.length);
        const pointB = polygon[index2];
        const side = Segment.init(pointA, pointB);
        const vecA = Vector2D.init(pointA.x, pointA.y);
        const vecB = Vector2D.init(pointB.x, pointB.y);
        const vecAB = Vector2D.subtract(vecB, vecA);
        const normAB = normalizer(vecAB);
        const offsetAB = Vector2D.init(normAB.x * offset, normAB.y * offset);
        const newSide = Segment.move(side, offsetAB.x, offsetAB.y);
        newSides.push(Segment.toLine(newSide));
    }
    const output: Point[] = [];
    for (let index1 = 0; index1 < newSides.length; index1++) {
        const side1 = newSides[index1];
        const index2 = overflowIndex(index1 + 1, newSides.length);
        const side2 = newSides[index2];
        const intersection = Line.intersect(side1, side2);
        if (Point.isPoint(intersection)) {
            output[index2] = intersection;
        } else {
            throw "error";
        }
    }
    return output;
}

function overflowIndex(index: number, length: number): number {
    return index === length ? 0 : index;
}

function getNormalizer(polygon: Point[]): (vector: Vector2D) => Vector2D {
    const [pointA, pointB, pointC] = polygon;
    const vecA = Vector2D.init(pointA.x, pointA.y);
    const vecB = Vector2D.init(pointB.x, pointB.y);
    const vecC = Vector2D.init(pointC.x, pointC.y);
    const vecAB = Vector2D.subtract(vecB, vecA);
    const vecBC = Vector2D.subtract(vecC, vecB);
    const cwNorm = cwNormalizer(vecAB);
    return Vector2D.dot(cwNorm, vecBC) > 0
        ? ccwNormalizer
        : cwNormalizer;
}

function cwNormalizer(vec: Vector2D): Vector2D {
    const { x, y } = vec;
    return Vector2D.normalize(Vector2D.init(y, -x));
}

function ccwNormalizer(vec: Vector2D): Vector2D {
    const { x, y } = vec;
    return Vector2D.normalize(Vector2D.init(-y, x));
}

function equals(polygon1: Point[], polygon2: Point[]): boolean {
    if (polygon1.length !== polygon2.length) {
        return false;
    }
    for (let index = 0; index < polygon1.length; index++) {
        const point1 = polygon1[index];
        const point2 = polygon2[index];
        if (!Point.equals(point1, point2)) {
            return false;
        }
    }
    return true;
}

export const Polygon = {
    collision: collision,
    containsPoint: containsPoint,
    pathToPoint: pathToPoint,
    pathToPolygon: pathToPolygon,
    move: move,
    scale: scale,
    equals: equals
};