import { assert } from "chai";
import { Point } from "..";
import { Line } from "../line";
import { Segment } from "../segment";

describe("Segment", () => {
    test("init - error", () => {
        assert.throws(
            () => Segment.init(
                Point.init(1, 2),
                Point.init(1, 2)
            ),
            /of length 0/i
        );
    });

    test("slope - numeric", () => {
        const seg = Segment.init(
            Point.init(0, 0),
            Point.init(3, 4)
        );
        const result = Segment.slope(seg);
        assert.strictEqual(result, 4 / 3);
    });

    test("slope - vertical", () => {
        const seg = Segment.init(
            Point.init(3, -4),
            Point.init(3, -1)
        );
        const result = Segment.slope(seg);
        assert.strictEqual(result, "vertical");
    });

    test("length", () => {
        const seg = Segment.init(
            Point.init(-3, -4),
            Point.init(3, 4)
        );
        const result = Segment.length(seg);
        assert.strictEqual(result, 10);
    });

    test("contains - endpoint", () => {
        const seg = Segment.init(
            Point.init(-1, 2),
            Point.init(4, 3)
        );
        assert.isTrue(Segment.contains(
            seg,
            Point.init(-1, 2)
        ));
    });

    test("contains - midpoint", () => {
        const seg = Segment.init(
            Point.init(-4, -4),
            Point.init(10, 10)
        );
        assert.isTrue(Segment.contains(
            seg,
            Point.init(-1, -1)
        ));
    });

    test("contains - false", () => {
        const seg = Segment.init(
            Point.init(0, 0),
            Point.init(1, 1)
        );
        assert.isFalse(Segment.contains(
            seg,
            Point.init(20, -500)
        ));
    });

    test("intersect - Segment", () => {
        const seg1 = Segment.init(
            Point.init(0, 0),
            Point.init(5, 5)
        );
        const seg2 = Segment.init(
            Point.init(2, 2),
            Point.init(10, 10)
        );
        const result = Segment.intersect(seg1, seg2);
        assert.deepStrictEqual(
            result,
            Segment.init(
                Point.init(2, 2),
                Point.init(5, 5)
            )
        );
    });

    test("intersect - Point", () => {
        const seg1 = Segment.init(
            Point.init(5, 1),
            Point.init(-2, 4)
        );
        const seg2 = Segment.init(
            Point.init(5, -3),
            Point.init(5, 1)
        );
        const result = Segment.intersect(seg1, seg2);
        assert.deepStrictEqual(
            result,
            Point.init(5, 1)
        );
    });

    test("intersect - false", () => {
        const seg1 = Segment.init(
            Point.init(-3, 2),
            Point.init(1, 1)
        );
        const seg2 = Segment.init(
            Point.init(20, 50),
            Point.init(40, 20)
        );
        assert.isFalse(Segment.intersect(seg1, seg2));
    });

    test("pathToPoint - start", () => {
        const seg = Segment.init(
            Point.init(-1, -1),
            Point.init(3, 5)
        );
        const point = Point.init(-5, -10);
        const result = Segment.pathToPoint(seg, point);
        const expected = Segment.init(
            Point.init(-1, -1),
            Point.init(-5, -10)
        );
        assert.deepStrictEqual(result, expected);
    });

    test("pathToPoint - middle", () => {
        const seg = Segment.init(
            Point.init(-1, -1),
            Point.init(3, 5)
        );
        const point = Point.init(1, 1);
        const result = Segment.pathToPoint(seg, point);
        const x = 7 / 13;
        const y = Line.calcY(Line.init(1.5, 0.5), x);
        const expected = Segment.init(
            Point.init(1, 1),
            Point.init(x, y)
        );
        expect(result.point1.x).toBeCloseTo(expected.point1.x);
        expect(result.point1.y).toBeCloseTo(expected.point1.y);
        expect(result.point2.x).toBeCloseTo(expected.point2.x);
        expect(result.point2.y).toBeCloseTo(expected.point2.y);
    });

    test("pathToPoint - end", () => {
        const seg = Segment.init(
            Point.init(-1, -1),
            Point.init(3, 5)
        );
        const point = Point.init(20, 5);
        const result = Segment.pathToPoint(seg, point);
        const expected = Segment.init(
            Point.init(3, 5),
            point
        );
        assert.deepStrictEqual(result, expected);
    });
});