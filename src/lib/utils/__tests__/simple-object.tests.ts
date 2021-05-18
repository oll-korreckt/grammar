import { assert } from "chai";
import { SimpleObject } from "..";

describe("SimpleObject", () => {
    describe("deepEquals", () => {
        describe("typed", () => {
            test("diff prop values", () => {
                const obj1 = {
                    name: "bob",
                    age: 22
                };
                const obj2 = {
                    name: "bob",
                    age: 23
                };
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isFalse(result);
            });

            test("diff shape", () => {
                const obj1 = {
                    firstName: "bob",
                    lastName: "smith"
                };
                const obj2 = {
                    firstName: "bob",
                    lastName: "smith",
                    age: 22
                };
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isFalse(result);
            });

            test("diff nested shape", () => {
                const obj1 = {
                    A: true,
                    B: {
                        b1: 1,
                        b2: 2,
                        b3: 3
                    }
                };
                const obj2 = {
                    A: true,
                    B: {
                        b1: 1,
                        b2: 2,
                        b3: 3,
                        b4: 4
                    }
                };
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isFalse(result);
            });

            test("diff nested prop values", () => {
                const obj1 = {
                    A: true,
                    B: {
                        b1: true
                    }
                };
                const obj2 = {
                    A: true,
                    B: {
                        b1: false
                    }
                };
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isFalse(result);
            });

            test("equal", () => {
                const obj1 = {
                    name: "value",
                    obj: {
                        name: "value"
                    }
                };
                const obj2 = {
                    name: "value",
                    obj: {
                        name: "value"
                    }
                };
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isTrue(result);
            });
        });

        describe("untyped", () => {
            test("diff prop names", () => {
                const obj1 = { name: "bob" } as any;
                const obj2 = { age: 22 } as any;
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isFalse(result);
            });

            test("diff prop types", () => {
                const obj1 = { name: "bob" } as any;
                const obj2 = { name: 5 } as any;
                const result = SimpleObject.deepEquals(obj1, obj2);
                assert.isFalse(result);
            });

            test("not objects", () => {
                const result = SimpleObject.deepEquals("string" as any, 2 as any);
                assert.isFalse(result);
            });
        });
    });

    describe("clone", () => {
        test("simple", () => {
            const expected = {
                age: 45,
                firstName: "bob",
                lastName: "smith"
            };
            const result = SimpleObject.clone(expected);
            assert.notEqual(result, expected);
            assert.deepEqual(result, expected);
        });

        test("nested", () => {
            const obj1 = {
                age: 25,
                employed: false,
                name: {
                    firstName: "bob",
                    lastName: "smith"
                }
            };
            const obj2 = SimpleObject.clone(obj1);
            assert.deepEqual(obj1, obj2);
            obj1.name.firstName = "jim";
            assert.notDeepEqual(obj1, obj2);
        });
    });
});
