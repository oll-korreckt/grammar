import { Point } from ".";
import { Line } from "./line";
import { Segment } from "./segment";
import { Slope } from "./slope";
import { GeometricObject } from "./types";
import { Utils } from "./utils";

export interface Ray extends GeometricObject {
    geometricType: "ray";
    endpoint: Point;
    direction: Point;
}

function init(endpoint: Point, direction: Point): Ray {
    if (Point.equals(endpoint, direction)) {
        throw "cannot create a ray from the same points";
    }
    return { geometricType: "ray", endpoint, direction };
}

function slope(ray: Ray): Slope {
    const { endpoint, direction } = ray;
    return Slope.calc(endpoint, direction);
}

function toLine(ray: Ray): Line {
    const { endpoint } = ray;
    const raySlope = slope(ray);
    if (raySlope === "vertical") {
        return Line.init(endpoint.x);
    }
    const intercept = endpoint.y - raySlope * endpoint.x;
    return Line.init(raySlope, intercept);
}

function getNumberComparer(value1: number, value2: number): (value1: number, value2: number) => boolean {
    if (Utils.lessThan(value1, value2)) {
        return Utils.lessThanOrEqualTo;
    } else if (Utils.greaterThan(value1, value2)) {
        return Utils.greaterThanOrEqualTo;
    }
    return () => true;
}

function makeComparer(ray: Ray): (point: Point) => boolean {
    const { endpoint, direction } = ray;
    const xComparer = getNumberComparer(direction.x, endpoint.x);
    const yComparer = getNumberComparer(direction.y, endpoint.y);
    return ({ x, y }) => xComparer(x, endpoint.x) && yComparer(y, endpoint.y);
}

function containsPoint(ray: Ray, point: Point): boolean {
    const line = toLine(ray);
    const comparer = makeComparer(ray);
    return comparer(point) && Line.containsPoint(line, point);
}

function collision(ray: Ray, other: Segment): boolean {
    const rayLine = toLine(ray);
    const comparer = makeComparer(ray);
    const otherLine = Segment.toLine(other);
    const intersection = Line.intersect(rayLine, otherLine);
    if (intersection === "parallel") {
        return false;
    } else if (intersection === "identical") {
        return comparer(other.point1) || comparer(other.point2);
    }
    return containsPoint(ray, intersection);
}

export const Ray = {
    init: init,
    isRay: Utils.createTypeGuard<Ray>("ray"),
    slope: Segment.slope,
    collision: collision
};