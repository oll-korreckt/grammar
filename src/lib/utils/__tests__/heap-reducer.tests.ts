import sizeof from "object-sizeof";
import { HeapReducer } from "../heap-reducer";
import { assert } from "chai";

describe("HeapReducer", () => {
    test("no redundancy - object", () => {
        const inputObj = {
            name: "bob",
            age: { value: 3 }
        };
        const outputObj = HeapReducer.run(inputObj);
        assert.deepStrictEqual(outputObj, inputObj);
        assert.strictEqual(sizeof(outputObj), sizeof(inputObj));
    });

    test("no redundancy - array", () => {
        const inputArr = [
            { name: "bob" },
            { age: 3 }
        ];
        const outputArr = HeapReducer.run(inputArr);
        assert.deepStrictEqual(outputArr, inputArr);
        assert.strictEqual(sizeof(outputArr), sizeof(inputArr));
    });

    test("redundancy - object", () => {
        const inputObj = {
            name: "bob",
            prop1: { name: "bob" },
            prop2: { name: "bob" },
            prop3: {
                prop1: { name: "bob" },
                prop2: { name: "bob" }
            },
            prop4: {
                prop1: { name: "bob" },
                prop2: { name: "bob" }
            }
        };
        const outputObj = HeapReducer.run(inputObj);
        assert.deepStrictEqual(outputObj, inputObj);
        expect(sizeof(outputObj)).toBeLessThan(sizeof(inputObj));
    });

    test("redundancy - array", () => {
        const inputArr = [
            { name: "bob" },
            { name: "bob" },
            { prop1: { name: "bob" }, prop2: { name: "bob" } },
            { prop1: { name: "bob" }, prop2: { name: "bob" } }
        ];
        const outputArr = HeapReducer.run(inputArr);
        assert.deepStrictEqual(outputArr, inputArr);
        expect(sizeof(outputArr)).toBeLessThan(sizeof(inputArr));
    });
});