import { assert } from "chai";
import { Point } from "..";

describe("Points", () => {
    test("equals - true", () => {
        const x = Point.init(1, 2);
        const y = Point.init(1, 2);
        assert.isTrue(Point.equals(x, y));
    });

    test("equals - false", () => {
        const x = Point.init(-1, 2);
        const y = Point.init(0, 0);
        assert.isFalse(Point.equals(x, y));
    });

    test("distance", () => {
        const x = Point.init(0, 0);
        const y = Point.init(3, 4);
        assert.strictEqual(Point.distance(x, y), 5);
    });

    test("add", () => {
        const x = Point.init(4, -5);
        const y = Point.init(2, 1);
        assert.deepStrictEqual(
            Point.add(x, y),
            Point.init(6, -4)
        );
    });

    test("subtract", () => {
        const x = Point.init(3, -5);
        const y = Point.init(0, -3);
        assert.deepStrictEqual(
            Point.subtract(x, y),
            Point.init(3, -2)
        );
    });

    test("angle - 90", () => {
        const a = Point.init(0, 10);
        const b = Point.init(0, 0);
        const c = Point.init(-10, 0);
        const result = Point.angle(a, b, c);
        expect(result).toBeCloseTo(90);
    });

    test("angle - 180", () => {
        const a = Point.init(0, 10);
        const b = Point.init(0, 0);
        const c = Point.init(0, -10);
        const result = Point.angle(a, b, c);
        expect(result).toBeCloseTo(180);
    });

    test("angle - 0", () => {
        const a = Point.init(0, 10);
        const b = Point.init(0, 0);
        const c = Point.init(0, 5);
        const result = Point.angle(a, b, c);
        expect(result).toBeCloseTo(0);
    });
});