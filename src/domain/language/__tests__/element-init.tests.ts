import { assert } from "chai";
import { initElement } from "../element-init";
import { VerbPhrase } from "../_types";

describe("element-init", () => {
    test("initElement", () => {
        const expected: VerbPhrase = {
            id: "hi",
            phraseType: "verb"
        };
        const result = initElement("verbPhrase", "hi");
        assert.deepEqual(result, expected);
    });
});