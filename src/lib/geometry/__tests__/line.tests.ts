import { assert } from "chai";
import { Point } from "..";
import { Line } from "../line";

describe("Line", () => {
    test("init - vertical", () => {
        const result = Line.init(5);
        assert.isTrue(Line.isVerticalLine(result));
        assert.isFalse(Line.isSlopeIntercept(result));
    });

    test("init - slope-intercept", () => {
        const result = Line.init(3, 2);
        assert.isFalse(Line.isVerticalLine(result));
        assert.isTrue(Line.isSlopeIntercept(result));
    });

    test("calcY", () => {
        const line = Line.init(3, 2);
        const result = Line.calcY(line, 2);
        assert.strictEqual(result, 8);
    });

    test("intersect - Point", () => {
        const line1 = Line.init(3, -1);
        const line2 = Line.init(2);
        const result = Line.intersect(line1, line2);
        assert.deepStrictEqual(
            result,
            Point.init(2, 5)
        );
    });

    test("intersect - parallel", () => {
        const line1 = Line.init(4);
        const line2 = Line.init(-5);
        const result = Line.intersect(line1, line2);
        assert.strictEqual(result, "parallel");
    });

    test("intersect - identical", () => {
        const line1 = Line.init(-1, 4);
        const line2 = Line.init(-1, 4);
        const result = Line.intersect(line1, line2);
        assert.strictEqual(result, "identical");
    });
});