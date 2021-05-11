import { assert } from "chai";
import { ElementId } from "../element-id";

describe("createWordId", () => {
    test("works", () => {
        const result = ElementId.createWordId(4);
        assert.equal(result, "1.4");
    });
});