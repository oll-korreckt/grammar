import { SimpleObject, SimpleArray } from "@lib/utils";
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
                const expected = AtomicChange.createDelete(["name"], "bob");
                const input = AtomicChange.createSet(["name"], undefined, "bob");
                const result = AtomicChange.invertChange(input);
                assert.deepEqual(result, expected);
            });
        });

        test("delete", () => {
            const expected = AtomicChange.createSet(["name"], undefined, "bob");
            const input = AtomicChange.createDelete(["name"], "bob");
            const result = AtomicChange.invertChange(input);
            assert.deepEqual(result, expected);
        });

        test("remove", () => {
            const expected = AtomicChange.createInsert([2], "c");
            const input = AtomicChange.createRemove([2], "c");
            const result = AtomicChange.invertChange(input);
            assert.deepEqual(result, expected);
        });

        test("insert", () => {
            const expected = AtomicChange.createInsert([2], "c");
            const input = AtomicChange.createRemove([2], "c");
            const result = AtomicChange.invertChange(input);
            assert.deepEqual(result, expected);
        });
    });

    describe("SimpleObject", () => {
        let initialState: SimpleObject;
        beforeEach(() => {
            initialState = {
                name: "bob",
                age: 24,
                occupation: {
                    title: "programmer",
                    company: "people that write code for free, inc",
                    salary: 0
                },
                friends: ["jim", "nancy"]
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
                    },
                    friends: ["jim", "nancy"]
                };
                const result = AtomicChange.apply(initialState);
                assert.deepEqual(result, expected);
                assert.notEqual(result, expected);
            });

            test("1", () => {
                const expected = {
                    name: "bob",
                    age: 24,
                    friends: ["jim", "nancy"]
                };
                const result = AtomicChange.apply(
                    initialState,
                    AtomicChange.createDelete(["occupation"], initialState["occupation"])
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
                    },
                    friends: ["nancy"]
                };
                const result = AtomicChange.apply(
                    initialState,
                    AtomicChange.createSet(["name"], "bob", "jim"),
                    AtomicChange.createSet(["age"], 24, 800),
                    AtomicChange.createDelete(["occupation"], initialState["occupation"]),
                    AtomicChange.createSet(["occupation"], undefined, { title: "bazillionaire", salary: 438904537 }),
                    AtomicChange.createRemove(["friends", 0], initialState["friends"][0])
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
                    AtomicChange.createSet(
                        ["name"],
                        initialState["name"],
                        "jim"
                    )
                ];
                let result = AtomicChange.apply(initialState, ...changes);
                assert.notDeepEqual(result, initialState);
                result = AtomicChange.applyInverse(result, ...changes);
                assert.deepEqual(result, initialState);
                assert.notEqual(result, initialState);
            });

            test("multiple", () => {
                const changes = [
                    AtomicChange.createDelete(
                        ["name"],
                        initialState["name"]
                    ),
                    AtomicChange.createSet(
                        ["age"],
                        initialState["age"],
                        30
                    ),
                    AtomicChange.createDelete(
                        ["occupation"],
                        initialState["occupation"]
                    )
                ];
                let result = AtomicChange.apply(initialState, ...changes);
                assert.notDeepEqual(result, initialState);
                result = AtomicChange.applyInverse(result, ...changes);
                assert.deepEqual(result, initialState);
                assert.notEqual(result, initialState);
            });
        });
    });

    describe("SimpleArray", () => {
        test("empty array", () => {
            const input: SimpleArray = [];
            const insert = AtomicChange.createInsert([0], "hello");
            let result = AtomicChange.apply(input, insert, insert);
            assert.deepEqual(result, ["hello", "hello"]);
            result = AtomicChange.applyInverse(result, insert, insert);
            assert.deepEqual([], result);
        });

        test("remove", () => {
            const input: SimpleArray = [undefined, 1, true, "three"];
            const remove = AtomicChange.createRemove([1], 1);
            let result = AtomicChange.apply(input, remove);
            assert.deepEqual(result, [undefined, true, "three"]);
            result = AtomicChange.applyInverse(result, remove);
            assert.deepEqual(result, input);
        });
    });

    describe("errors", () => {
        const regEx = /requires a value of type/;
        test("expected object", () => {
            const target: SimpleArray = [];
            const setChg = AtomicChange.createSet(["hello"], "name", "firstName");
            const deleteChg = AtomicChange.createDelete(["hello"], "name");
            expect(() => AtomicChange.apply(target, setChg)).toThrow(regEx);
            expect(() => AtomicChange.apply(target, deleteChg)).toThrow(regEx);
        });

        test("expected array", () => {
            const target: SimpleObject = {};
            const insertChg = AtomicChange.createInsert([0], "a");
            const removeChg = AtomicChange.createRemove([0], "a");
            expect(() => AtomicChange.apply(target, insertChg)).toThrow(regEx);
            expect(() => AtomicChange.apply(target, removeChg)).toThrow(regEx);
        });
    });
});