import { Point } from "./point";
import { GeometricObject } from "./types";
import { Utils } from "./utils";

export interface SlopeInterceptForm extends GeometricObject {
    geometricType: "line: slope-intercept";
    slope: number;
    intercept: number;
}

export interface VerticalLine extends GeometricObject {
    geometricType: "line: vertical";
    x: number;
}

export type LineType = "slopeIntercept" | "vertical";
export type Line = SlopeInterceptForm | VerticalLine;
type IntersectOutput = Point | "parallel" | "identical";

function init(slope: number, intercept: number): SlopeInterceptForm;
function init(x: number): VerticalLine;
function init(value1: number, value2?: number): Line {
    if (value2 === undefined) {
        return { geometricType: "line: vertical", x: value1 };
    }
    return {
        geometricType: "line: slope-intercept",
        slope: value1,
        intercept: value2
    };
}

function containsPoint(line: Line, point: Point): boolean {
    if (Line.isVerticalLine(line)) {
        return Utils.equalTo(line.x, point.x);
    } else {
        const y = calcY(line, point.x);
        return Utils.equalTo(point.y, y);
    }
}

function calcY(line: SlopeInterceptForm, x: number): number {
    return line.slope * x + line.intercept;
}

function _intersectSlopeIntercept(line1: SlopeInterceptForm, line2: SlopeInterceptForm): IntersectOutput {
    if (line1.slope === line2.slope) {
        return line1.intercept === line2.intercept ? "identical" : "parallel";
    }
    const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
    const y = calcY(line1, x);
    return Point.init(x, y);
}

function _intersectMixed(line1: SlopeInterceptForm, line2: VerticalLine): IntersectOutput {
    const x = line2.x;
    const y = calcY(line1, x);
    return Point.init(x, y);
}

function _intersectVertical(line1: VerticalLine, line2: VerticalLine): IntersectOutput {
    return line1.x === line2.x ? "identical" : "parallel";
}

function intersect(line1: Line, line2: Line): IntersectOutput {
    const line1SlopeIntercept = 1 << 0;
    const line2SlopeIntercept = 1 << 1;
    let state = 0;
    if (Line.isSlopeIntercept(line1)) {
        state |= line1SlopeIntercept;
    }
    if (Line.isSlopeIntercept(line2)) {
        state |= line2SlopeIntercept;
    }
    switch (state) {
        case 0:
            // both vertical
            return _intersectVertical(
                line1 as VerticalLine,
                line2 as VerticalLine
            );
        case line1SlopeIntercept:
            // line1: slope-intercept
            return _intersectMixed(
                line1 as SlopeInterceptForm,
                line2 as VerticalLine
            );
        case line2SlopeIntercept:
            // line2: slope-intercept
            return _intersectMixed(
                line2 as SlopeInterceptForm,
                line2 as VerticalLine
            );
        case line1SlopeIntercept | line2SlopeIntercept:
            // both slope-intercept
            return _intersectSlopeIntercept(
                line1 as SlopeInterceptForm,
                line2 as SlopeInterceptForm
            );
        default:
            throw `unhandled state '${state}'`;
    }
}

export const Line = {
    init: init,
    isLine: Utils.createTypeGuard<Line>("line: slope-intercept", "line: vertical"),
    isVerticalLine: Utils.createTypeGuard<VerticalLine>("line: vertical"),
    isSlopeIntercept: Utils.createTypeGuard<SlopeInterceptForm>("line: slope-intercept"),
    calcY: calcY,
    containsPoint: containsPoint,
    intersect: intersect
};