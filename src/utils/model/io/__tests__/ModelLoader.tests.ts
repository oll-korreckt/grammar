import { ModelLoader } from "../ModelLoader";
import path from "path";
import { assert } from "chai";

describe("ModelLoader", () => {
    const root = path.resolve(__dirname, "test-files");

    describe("createLoader", () => {
        test("valid loads", async () => {
            const loader = await ModelLoader.createLoader(root);
            const result1 = await loader("adjective-phrase", "ex1");
            const result2 = await loader("adjective-phrase", "ex2");
            const result = await loader("noun-phrase", "ex");
            const expected: any = { diagram: "" };
            assert.deepStrictEqual(result, expected);
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
        });

        test("invalid model", async () => {
            const loader = await ModelLoader.createLoader(root);
            const result = await loader("verb", "invalid-model");
            assert.strictEqual(result, "invalid model");
        });

        test("no model", async () => {
            const loader = await ModelLoader.createLoader(root);
            const result = await loader("participle", "hi");
            assert.strictEqual(result, "no model");
        });
    });

    describe("createLoaderSync", () => {
        test("valid loads", async () => {
            const loader = ModelLoader.createLoaderSync(root);
            const result1 = await loader("adjective-phrase", "ex1");
            const result2 = await loader("adjective-phrase", "ex2");
            const result = await loader("noun-phrase", "ex");
            const expected: any = { diagram: "" };
            assert.deepStrictEqual(result, expected);
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
        });

        test("invalid model", async () => {
            const loader = ModelLoader.createLoaderSync(root);
            const result = await loader("verb", "invalid-model");
            assert.strictEqual(result, "invalid model");
        });

        test("no model", async () => {
            const loader = ModelLoader.createLoaderSync(root);
            const result = await loader("participle", "hi");
            assert.strictEqual(result, "no model");
        });
    });
});