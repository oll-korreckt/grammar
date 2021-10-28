import { Point } from "@lib/geometry";
import { assert } from "chai";
import { MoveBounds, SubFunctions } from "../label-placement";

describe("label-placement", () => {
    describe("acceptWorse", () => {
        const numIterations = 1000;
        test("0", () => {
            let accepts = 0;
            for (let index = 0; index < numIterations; index++) {
                if (SubFunctions.acceptWorse(100, 0)) {
                    accepts++;
                }
            }
            assert.strictEqual(accepts, numIterations);
        });

        test("negative", () => {
            let accepts = 0;
            for (let index = 0; index < numIterations; index++) {
                if (SubFunctions.acceptWorse(100, -20)) {
                    accepts++;
                }
            }
            assert.strictEqual(accepts, numIterations);
        });

        test("positive", () => {
            let loTempAccepts = 0;
            let hiTempAccepts = 0;
            for (let index = 0; index < numIterations; index++) {
                if (SubFunctions.acceptWorse(1, 1)) {
                    loTempAccepts++;
                }
                if (SubFunctions.acceptWorse(100, 1)) {
                    hiTempAccepts++;
                }
            }
            assert.isTrue(hiTempAccepts > loTempAccepts);
        });
    });

    describe("randomInt", () => {
        test("no overlap", () => {
            const lowerBound = -1;
            const upperBound = 1;
            for (let index = 0; index < 100; index++) {
                const result = SubFunctions.randomInt(lowerBound, upperBound);
                assert.isTrue(result >= lowerBound && result <= upperBound);
            }
        });

        test("overlap", () => {
            const bound = 10;
            for (let index = 0; index < 100; index++) {
                const result = SubFunctions.randomInt(bound, bound);
                assert.strictEqual(result, bound);
            }
        });

        test("error", () => {
            assert.throw(() => SubFunctions.randomInt(10, -10));
        });
    });

    describe("getMoveBounds", () => {
        const bounds = [
            Point.init(0, 0),
            Point.init(0, 100),
            Point.init(100, 100),
            Point.init(100, 0)
        ] as [Point, Point, Point, Point];

        test("inside", () => {
            const label = [
                Point.init(45, 45),
                Point.init(45, 55),
                Point.init(55, 55),
                Point.init(55, 45)
            ];
            const result = SubFunctions.getMoveBounds(
                label,
                {
                    boundary: bounds,
                    maxStepSize: 25
                }
            );
            const expected: MoveBounds = {
                lowerX: -25,
                upperX: 25,
                lowerY: -25,
                upperY: 25
            };
            assert.deepStrictEqual(result, expected);
        });

        test("near boarder", () => {
            const label = [
                Point.init(5, 5),
                Point.init(5, 50),
                Point.init(50, 50),
                Point.init(50, 5)
            ];
            const result = SubFunctions.getMoveBounds(
                label,
                {
                    boundary: bounds,
                    maxStepSize: 100
                }
            );
            const expected: MoveBounds = {
                lowerX: -5,
                upperX: 50,
                lowerY: -5,
                upperY: 50
            };
            assert.deepStrictEqual(result, expected);
        });

        test("border - overlap", () => {
            const label = [
                Point.init(-5, -5),
                Point.init(-5, 5),
                Point.init(5, 5),
                Point.init(5, -5)
            ];
            const result = SubFunctions.getMoveBounds(
                label,
                {
                    boundary: bounds,
                    maxStepSize: 50
                }
            );
            const expected: MoveBounds = {
                lowerX: 5,
                upperX: 50,
                lowerY: 5,
                upperY: 50
            };
            assert.deepStrictEqual(result, expected);
        });

        test("border - outside", () => {
            const label = [
                Point.init(-20, -20),
                Point.init(-20, -10),
                Point.init(-10, -10),
                Point.init(-10, -20)
            ];
            const result = SubFunctions.getMoveBounds(
                label,
                {
                    boundary: bounds,
                    maxStepSize: 50
                }
            );
            const expected: MoveBounds = {
                lowerX: 20,
                upperX: 50,
                lowerY: 20,
                upperY: 50
            };
            assert.deepStrictEqual(result, expected);
        });
    });

    // test("title", () => {
    //     assert.isTrue(true);
    // });

    // test("does it even work?", () => {
    //     const labels: Point[][] = [
    //         Polygon.translateLinear([
    //             Point.init(1, 1),
    //             Point.init(11, 1),
    //             Point.init(11, 11),
    //             Point.init(1, 11)
    //         ], 500, 0),
    //         Polygon.translateLinear([
    //             Point.init(30, 30),
    //             Point.init(40, 30),
    //             Point.init(40, 40),
    //             Point.init(30, 40)
    //         ], 0, 500)
    //     ];
    //     const targets: Point[][] = [
    //         [
    //             Point.init(1, 1),
    //             Point.init(11, 1),
    //             Point.init(11, 11),
    //             Point.init(1, 11)
    //         ],
    //         [
    //             Point.init(21, 1),
    //             Point.init(31, 1),
    //             Point.init(31, 11),
    //             Point.init(21, 11)
    //         ]
    //     ];
    //     const result = labelPlacement(
    //         labels,
    //         targets,
    //         {
    //             coolingFactor: 0.9,
    //             initialTemperature: 0.91,
    //             boundary: [
    //                 Point.init(0, 0),
    //                 Point.init(1000, 0),
    //                 Point.init(1000, 1000),
    //                 Point.init(0, 1000)
    //             ],
    //             distancePenalty: 3,
    //             collisionPenalty: 100,
    //             maxStepSize: 30,
    //             quadrantPenalties: [0, 1, 3, 4]
    //         }
    //     );
    //     console.log(result.steps);
    //     console.log(`start: ${result.steps[0]}`);
    //     console.log(`end: ${result.steps[result.steps.length - 1]}`);
    //     console.log(`# steps: ${result.steps.length}`);
    // });
});