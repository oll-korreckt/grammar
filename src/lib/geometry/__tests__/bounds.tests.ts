import { assert } from "chai";
import { Bounds } from "../bounds";

function _runOverlap(bounds1: Bounds, bounds2: Bounds, expected: Bounds | false): void {
    const result = Bounds.overlap(bounds1, bounds2);
    assert.deepStrictEqual(result, expected);
}

describe("bounds", () => {
    test("overlap", () => {
        _runOverlap([0, 10], [80, 90], false);
        _runOverlap([0, 50], [40, 90], [40, 50]);
        _runOverlap([0, 50], [40, 45], [40, 45]);
        _runOverlap([0, 100], [0, 20], [0, 20]);
        _runOverlap([50, 150], [0, 200], [50, 150]);
        _runOverlap([50, 150], [10, 210], [50, 150]);
    });

    test("reverse order", () => {
        const expected: Bounds = [40, 45];
        _runOverlap([0, 50], [40, 45], expected);
        _runOverlap([0, 50], [45, 40], expected);
        _runOverlap([50, 0], [40, 45], expected);
        _runOverlap([50, 0], [45, 40], expected);
    });
});