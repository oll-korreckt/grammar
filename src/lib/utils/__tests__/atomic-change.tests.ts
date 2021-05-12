import { SimpleObject } from "@lib/utils";
import { assert } from "chai";
import { AtomicChange } from "../atomic-change";

describe("AtomicChange", () => {
    describe("invertChange", () => {
        describe("set", () => {
            test("replace", () => {
                const expected = AtomicChange.createSet(["name"], "jim", "bob");
                const input = AtomicChange.createSet(["name"], "bob", "jim");
                const result = AtomicChange.invertChange(input);
                assert.deepEqual(result, expected);
            });

            test("create", () => {
                const expected = AtomicChange.createRemove(["name"], "bob");
                const input = AtomicChange.createSet(["name"], undefined, "bob");
                const result = AtomicChange.invertChange(input);
                assert.deepEqual(result, expected);
            });
        });

        test("remove", () => {
            const expected = AtomicChange.createSet(["name"], undefined, "bob");
            const input = AtomicChange.createRemove(["name"], "bob");
            const result = AtomicChange.invertChange(input);
            assert.deepEqual(result, expected);
        });
    });

    describe("apply", () => {
        let initialState: SimpleObject;
        beforeEach(() => {
            initialState = {
                name: "bob",
                age: 24,
                occupation: {
                    title: "programmer",
                    company: "people that write code for free, inc",
                    salary: 0
                }
            };
        });

        describe("apply", () => {
            test("0", () => {
                const expected = {
                    name: "bob",
                    age: 24,
                    occupation: {
                        title: "programmer",
                        company: "people that write code for free, inc",
                        salary: 0
                    }
                };
                const result = AtomicChange.apply(initialState);
                assert.deepEqual(result, expected);
                assert.notEqual(result, expected);
            });

            test("1", () => {
                const expected = {
                    name: "bob",
                    age: 24
                };
                const result = AtomicChange.apply(
                    initialState,
                    AtomicChange.createRemove(["occupation"], initialState["occupation"])
                );
                assert.deepEqual(result, expected);
                assert.notEqual(result, expected);
            });

            test("multiple", () => {
                const expected = {
                    name: "jim",
                    age: 800,
                    occupation: {
                        title: "bazillionaire",
                        salary: 438904537
                    }
                };
                const result = AtomicChange.apply(
                    initialState,
                    AtomicChange.createSet(["name"], "bob", "jim"),
                    AtomicChange.createSet(["age"], 24, 800),
                    AtomicChange.createRemove(["occupation"], initialState["occupation"]),
                    AtomicChange.createSet(["occupation"], undefined, { title: "bazillionaire", salary: 438904537 })
                );
                assert.deepEqual(result, expected);
                assert.notEqual(result, expected);
            });
        });

        describe("applyInverse", () => {
            test("0", () => {
                let result = AtomicChange.apply(initialState);
                assert.deepEqual(result, initialState);
                result = AtomicChange.applyInverse(result);
                assert.deepEqual(result, initialState);
                assert.notEqual(result, initialState);
            });

            test("1", () => {
                const changes = [
                    AtomicChange.createSet(["name"], initialState["name"], "jim")
                ];
                let result = AtomicChange.apply(initialState, ...changes);
                assert.notDeepEqual(result, initialState);
                result = AtomicChange.applyInverse(result, ...changes);
                assert.deepEqual(result, initialState);
                assert.notEqual(result, initialState);
            });

            test("multiple", () => {
                const changes = [
                    AtomicChange.createRemove(["name"], initialState["name"]),
                    AtomicChange.createSet(["age"], initialState["age"], 30),
                    AtomicChange.createRemove(["occupation"], initialState["occupation"])
                ];
                let result = AtomicChange.apply(initialState, ...changes);
                assert.notDeepEqual(result, initialState);
                result = AtomicChange.applyInverse(result, ...changes);
                assert.deepEqual(result, initialState);
                assert.notEqual(result, initialState);
            });
        });
    });
});