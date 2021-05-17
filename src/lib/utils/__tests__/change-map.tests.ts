import { assert } from "chai";
import { ChangeMap } from "..";
import { AtomicChange, ChangeType } from "../atomic-change";

describe("ChangeMap", () => {
    describe("update", () => {
        test("simple", () => {
            const expected: ChangeMap = {
                keys: {
                    name: {
                        keys: {
                            firstName: { type: ChangeType.Set },
                            lastName: { type: ChangeType.Set }
                        }
                    }
                }
            };
            const result = ChangeMap.update(
                {},
                AtomicChange.createSet(
                    ["name", "firstName"],
                    undefined,
                    "bob"
                ),
                AtomicChange.createSet(
                    ["name", "lastName"],
                    undefined,
                    "smith"
                )
            );
            assert.deepEqual(result, expected);
        });

        test("nested", () => {
            const expected: ChangeMap = {
                keys: {
                    name: { type: ChangeType.Remove }
                }
            };
            const result = ChangeMap.update(
                {},
                AtomicChange.createSet(
                    ["name"],
                    undefined,
                    "bob"
                ),
                AtomicChange.createSet(
                    ["name"],
                    "bob",
                    { firstName: "bob", lastName: "smith" }
                ),
                AtomicChange.createSet(
                    ["name", "firstName"],
                    "bob",
                    "jim"
                ),
                AtomicChange.createRemove(
                    ["name"],
                    { firstName: "jim", lastName: "smith" }
                )
            );
            assert.deepEqual(result, expected);
        });
    });

    describe("getChanges", () => {
        test("simple", () => {
            const base = {
                name: {
                    firstName: "bob",
                    lastName: "smith"
                },
                age: 34
            };
            const curr = {
                name: "bob smith",
                age: 34
            };
            const map: ChangeMap = {
                keys: {
                    name: { type: ChangeType.Set }
                }
            };
            const expected = [
                AtomicChange.createSet(
                    ["name"],
                    { firstName: "bob", lastName: "smith" },
                    "bob smith"
                )
            ];
            const result = ChangeMap.getChanges(map, base, curr);
            assert.deepEqual(result, expected);
        });

        test("redundant - not equal", () => {
            const base = { name: "bob" };
            const curr = { name: "jim" };
            const map: ChangeMap = {
                keys: {
                    name: { type: ChangeType.Set }
                }
            };
            const expected = [
                AtomicChange.createSet(["name"], "bob", "jim")
            ];
            const result = ChangeMap.getChanges(map, base, curr);
            assert.deepEqual(result, expected);
        });

        test("redundant - equal", () => {
            const base = { name: "bob" };
            const curr = { name: "bob" };
            const map: ChangeMap = {
                keys: {
                    name: { type: ChangeType.Set },
                    age: { type: ChangeType.Remove }
                }
            };
            const result = ChangeMap.getChanges(map, base, curr);
            assert.deepEqual(result, []);
        });
    });
});