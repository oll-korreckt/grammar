import { assert } from "chai";
import { Point } from "..";
import { Polygon } from "../polygon";
import { Segment } from "../segment";
import { Vector2D } from "../vector-2d";

function sortSegment(segment: Segment): Segment {
    const { point1, point2 } = segment;
    const vec1 = Vector2D.init(point1.x, point1.y);
    const vec1Mag = Vector2D.length(vec1);
    const vec2 = Vector2D.init(point2.x, point2.y);
    const vec2Mag = Vector2D.length(vec2);
    return vec1Mag > vec2Mag
        ? Segment.init(point2, point1)
        : segment;
}

function segmentsEqual(seg1: Segment, seg2: Segment): void {
    const sortedSeg1 = sortSegment(seg1);
    const sortedSeg2 = sortSegment(seg2);
    assert.isTrue(Segment.equals(sortedSeg1, sortedSeg2));
}

describe("Polygon", () => {
    describe("collision", () => {
        const square = [
            Point.init(0, 0),
            Point.init(10, 0),
            Point.init(10, 10),
            Point.init(0, 10)
        ];
        describe("Polygon - Polygon", () => {
            test("inside", () => {
                const polygon2 = [
                    Point.init(1, 1),
                    Point.init(2, 2),
                    Point.init(3, 1)
                ];
                assert.isTrue(Polygon.collision(square, polygon2));
                assert.isTrue(Polygon.collision(polygon2, square));
            });

            test("overlap", () => {
                const polygon2 = [
                    Point.init(-1, -1),
                    Point.init(-2, 20),
                    Point.init(5, 5)
                ];
                assert.isTrue(Polygon.collision(square, polygon2));
                assert.isTrue(Polygon.collision(polygon2, square));
            });

            test("touching", () => {
                const polygon2 = [
                    Point.init(10, 5),
                    Point.init(15, 0),
                    Point.init(15, 10)
                ];
                assert.isTrue(Polygon.collision(square, polygon2));
                assert.isTrue(Polygon.collision(polygon2, square));
            });

            test("outside", () => {
                const polygon2 = [
                    Point.init(-1, -1),
                    Point.init(-2, 20),
                    Point.init(-5, -5)
                ];
                assert.isFalse(Polygon.collision(square, polygon2));
                assert.isFalse(Polygon.collision(polygon2, square));
            });
        });

        describe("Polygon - Segment", () => {
            test("inside", () => {
                const segment = Segment.init(
                    Point.init(4, 4),
                    Point.init(6, 6)
                );
                assert.isTrue(Polygon.collision(square, segment));
                assert.isTrue(Polygon.collision(segment, square));
            });

            test("touching", () => {
                const segment = Segment.init(
                    Point.init(0, 5),
                    Point.init(-5, 5)
                );
                assert.isTrue(Polygon.collision(square, segment));
                assert.isTrue(Polygon.collision(segment, square));
            });

            test("overlap", () => {
                const segment = Segment.init(
                    Point.init(-1, 5),
                    Point.init(2, 2)
                );
                assert.isTrue(Polygon.collision(square, segment));
                assert.isTrue(Polygon.collision(segment, square));
            });

            test("outside", () => {
                const segment = Segment.init(
                    Point.init(-20, 20),
                    Point.init(20, 15)
                );
                assert.isFalse(Polygon.collision(square, segment));
                assert.isFalse(Polygon.collision(segment, square));
            });

            test("colinear - no overlap", () => {
                const segment = Segment.init(
                    Point.init(10, 11),
                    Point.init(10, 20)
                );
                assert.isFalse(Polygon.collision(square, segment));
                assert.isFalse(Polygon.collision(segment, square));
            });
        });
    });

    describe("pathToPoint", () => {
        const square1 = [
            Point.init(0, 0),
            Point.init(10, 0),
            Point.init(10, 10),
            Point.init(0, 10)
        ];
        test("side by side", () => {
            const result = Polygon.pathToPoint(square1, Point.init(15, 5));
            segmentsEqual(
                result,
                Segment.init(
                    Point.init(10, 5),
                    Point.init(15, 5)
                )
            );
        });

        test("corner", () => {
            const result = Polygon.pathToPoint(square1, Point.init(15, 15));
            segmentsEqual(
                result,
                Segment.init(
                    Point.init(10, 10),
                    Point.init(15, 15)
                )
            );
        });
    });

    describe("pathToPolygon", () => {
        const square = [
            Point.init(0, 0),
            Point.init(10, 0),
            Point.init(10, 10),
            Point.init(0, 10)
        ];
        test("side by side", () => {
            const other = [
                Point.init(20, 0),
                Point.init(30, 0),
                Point.init(30, 10),
                Point.init(20, 10)
            ];
            const result1 = Polygon.pathToPolygon(square, other);
            const resultLength1 = Segment.length(result1);
            const result2 = Polygon.pathToPolygon(other, square);
            const resultLength2 = Segment.length(result2);
            assert.strictEqual(resultLength1, 10);
            assert.strictEqual(resultLength2, 10);
        });

        test("corners", () => {
            const other = [
                Point.init(20, 20),
                Point.init(30, 20),
                Point.init(30, 30)
            ];
            const result1 = Polygon.pathToPolygon(square, other);
            const result2 = Polygon.pathToPolygon(other, square);
            const expected = Segment.init(
                Point.init(10, 10),
                Point.init(20, 20)
            );
            segmentsEqual(result1, expected);
            segmentsEqual(result2, expected);
        });

        test("corner - angeled", () => {
            const other = [
                Point.init(5, 30),
                Point.init(30, 5),
                Point.init(50, 10)
            ];
            const result1 = Polygon.pathToPolygon(square, other);
            const result2 = Polygon.pathToPolygon(other, square);
            const expected = Segment.init(
                Point.init(10, 10),
                Point.init(17.5, 17.5)
            );
            segmentsEqual(result1, expected);
            segmentsEqual(result2, expected);
        });
    });

    describe("scale", () => {
        const square = [
            Point.init(0, 0),
            Point.init(10, 0),
            Point.init(10, 10),
            Point.init(0, 10)
        ];
        test("bigger", () => {
            const result = Polygon.scale(square, 1);
            const expected = [
                Point.init(-1, -1),
                Point.init(11, -1),
                Point.init(11, 11),
                Point.init(-1, 11)
            ];
            assert.isTrue(Polygon.equals(result, expected));
        });

        test("smaller", () => {
            const result = Polygon.scale(square, -2);
            const expected = [
                Point.init(2, 2),
                Point.init(8, 2),
                Point.init(8, 8),
                Point.init(2, 8)
            ];
            assert.isTrue(Polygon.equals(result, expected));
        });
    });
});