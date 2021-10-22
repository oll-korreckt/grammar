import { assert } from "chai";
import { Point } from "..";
import { Rectangle } from "../rectangle";
import { Utils } from "../utils";

describe("Rectangle", () => {
    test("init - error", () => {
        const msg = /do not form a rectangle/i;
        assert.throws(
            () => Rectangle.init(
                Point.init(0, 0),
                Point.init(10, 0),
                Point.init(10, 11),
                Point.init(0, 10)
            ),
            msg
        );
        assert.throws(
            () => Rectangle.init(
                Point.init(0, 0),
                Point.init(0, 0),
                Point.init(10, 10),
                Point.init(0, 10)
            ),
            msg
        );
    });

    test("area", () => {
        const rect = Rectangle.init(
            Point.init(0, 0),
            Point.init(5, 0),
            Point.init(5, 10),
            Point.init(0, 10)
        );
        const result = Rectangle.area(rect);
        assert.isTrue(Utils.equalTo(result, 50));
    });

    test("area - rotated", () => {
        const rect = Rectangle.init(
            Point.init(5, 0),
            Point.init(10, 5),
            Point.init(5, 10),
            Point.init(0, 5)
        );
        const result = Rectangle.area(rect);
        assert.isTrue(Utils.equalTo(result, 50));
    });
});