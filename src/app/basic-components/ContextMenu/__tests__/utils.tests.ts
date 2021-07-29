import { Rect, PartialRect } from "@app/utils";
import { assert } from "chai";
import { placeMenu } from "../utils";

describe("utils", () => {
    describe("placeMenu", () => {
        const win: PartialRect = { width: 100, height: 100 };
        describe("vertical", () => {
            test("aboveTarget", () => {
                const target: Rect = {
                    top: 90,
                    height: 10,
                    left: 0,
                    width: 10
                };
                const menu: PartialRect = {
                    height: 10,
                    width: 10
                };
                const { top, vType } = placeMenu(target, menu, win, 5);
                assert.strictEqual(top, 75);
                assert.strictEqual(vType, "aboveTarget");
            });

            test("belowTarget", () => {
                const target: Rect = {
                    top: 50,
                    height: 10,
                    left: 0,
                    width: 10
                };
                const menu: PartialRect = {
                    height: 10,
                    width: 10
                };
                const { top, vType } = placeMenu(target, menu, win, 5);
                assert.strictEqual(top, 65);
                assert.strictEqual(vType, "belowTarget");
            });

            test("centerWindow", () => {
                const target: Rect = {
                    top: 50,
                    height: 10,
                    left: 0,
                    width: 10
                };
                const menu: PartialRect = {
                    height: 90,
                    width: 90
                };
                const { top, vType } = placeMenu(target, menu, win, 5);
                assert.strictEqual(top, 5);
                assert.strictEqual(vType, "centerWindow");
            });
        });

        describe("horizontal", () => {
            test("centerTarget", () => {
                const target: Rect = {
                    top: 50,
                    height: 10,
                    left: 25,
                    width: 50
                };
                const menu: PartialRect = {
                    height: 20,
                    width: 20
                };
                const { left, hType } = placeMenu(target, menu, win, 5);
                assert.strictEqual(left, 40);
                assert.strictEqual(hType, "centerTarget");
            });

            test("leftTarget", () => {
                const target: Rect = {
                    top: 50,
                    height: 10,
                    left: 0,
                    width: 20
                };
                const menu: PartialRect = {
                    height: 20,
                    width: 30
                };
                const { left, hType } = placeMenu(target, menu, win, 5);
                assert.strictEqual(left, 5);
                assert.strictEqual(hType, "leftTarget");
            });

            test("rightTarget", () => {
                const target: Rect = {
                    top: 50,
                    height: 10,
                    left: 90,
                    width: 10
                };
                const menu: PartialRect = {
                    height: 20,
                    width: 30
                };
                const { left, hType } = placeMenu(target, menu, win, 5);
                assert.strictEqual(left, 65);
                assert.strictEqual(hType, "rightTarget");
            });

            test("centerWindow", () => {
                const target: Rect = {
                    top: 50,
                    height: 10,
                    left: 90,
                    width: 10
                };
                const menu: PartialRect = {
                    height: 20,
                    width: 90
                };
                const { left, hType } = placeMenu(target, menu, win, 20);
                assert.strictEqual(left, 5);
                assert.strictEqual(hType, "centerWindow");
            });
        });

        describe("errors", () => {
            test("height greater", () => {
                const target: Rect = {
                    top: 90,
                    left: 90,
                    width: 10,
                    height: 10
                };
                const menu: PartialRect = {
                    width: 10,
                    height: 110
                };
                assert.throw(
                    () => placeMenu(target, menu, win, 5),
                    /height greater/i
                );
            });

            test("width greater", () => {
                const target: Rect = {
                    top: 90,
                    left: 90,
                    width: 10,
                    height: 10
                };
                const menu: PartialRect = {
                    width: 110,
                    height: 10
                };
                assert.throw(
                    () => placeMenu(target, menu, win, 5),
                    /width greater/i
                );
            });
        });
    });
});