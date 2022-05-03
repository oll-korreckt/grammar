import { isModelLoaderError, ModelLoader } from "../ModelLoader";
import path from "path";
import { assert } from "chai";
import fs from "fs";
import { DirectoryItem, FileSystem } from "@utils/io";
import { ElementModelAddress, Model } from "@utils/model/types";
import { DiagramState } from "@app/utils";
import nodepath from "path";

describe("ModelLoader", () => {
    const root = path.resolve(__dirname, "test-files");
    const {
        getModelAddresses,
        getModel,
        updateModel,
        renameModel,
        deleteModel,
        addModel
    } = ModelLoader.createLoader(root);

    function clearDirectory(): void {
        const { children } = FileSystem.readdirSync(root);
        if (children === undefined) {
            return;
        }
        Object.values(children).forEach(({ fullPath }) => {
            fs.unlinkSync(fullPath);
        });
    }

    function createModel(address: ElementModelAddress, model?: Model): void {
        const filename = `${address.page}.${address.name}.json`;
        const filepath = path.resolve(root, filename);
        const content = model ? JSON.stringify(model) : "";
        fs.writeFileSync(filepath, content);
    }

    describe("getModelAddresses", () => {
        test("no args", async () => {
            clearDirectory();
            const expected: ElementModelAddress[] = [
                { page: "adjective", name: "model1" },
                { page: "adjective-phrase", name: "model2" }
            ];
            expected.forEach((address) => createModel(address));
            const result = await getModelAddresses();
            if (isModelLoaderError(result)) {
                throw result.msg;
            }
            result.sort(ElementModelAddress.sort);
            expected.sort(ElementModelAddress.sort);
            assert.deepStrictEqual(result, expected);
        });

        test("with args", async () => {
            clearDirectory();
            const address1: ElementModelAddress = {
                page: "adjective",
                name: "model1"
            };
            const address2: ElementModelAddress = {
                page: "adjective",
                name: "model2"
            };
            const address3: ElementModelAddress = {
                page:"adverb-phrase",
                name: "model1"
            };
            await addModel(address1);
            await addModel(address2);
            await addModel(address3);
            const result1 = await getModelAddresses("adjective");
            if (isModelLoaderError(result1)) {
                assert.fail();
            }
            const expected1 = [address1, address2];
            assert.deepStrictEqual(
                result1.sort(ElementModelAddress.sort),
                expected1.sort(ElementModelAddress.sort)
            );
            const result2 = await getModelAddresses("adverb");
            if (isModelLoaderError(result2)) {
                assert.fail();
            }
            assert.deepStrictEqual(result2, []);
            const result3 = await getModelAddresses();
            if (isModelLoaderError(result3)) {
                assert.fail();
            }
            const expected3 = [address1, address2, address3];
            assert.deepStrictEqual(
                result3.sort(ElementModelAddress.sort),
                expected3.sort(ElementModelAddress.sort)
            );
        });
    });

    describe("getModel", () => {
        test("standard", async () => {
            clearDirectory();
            const address: ElementModelAddress = {
                page: "adjective-phrase",
                name: "item"
            };
            const model: Model = { diagram: DiagramState.initEmpty() };
            await createModel(address, model);
            const result = await getModel(address);
            assert.deepStrictEqual(result, model);
        });

        test("error: no model", async () => {
            clearDirectory();
            const result = await getModel({ page: "adjective-phrase", name: "item" });
            if (!isModelLoaderError(result)) {
                assert.fail();
            }
            assert.deepStrictEqual(result.errType, "resource not found");
        });

        test("internal error", async () => {
            clearDirectory();
            const address: ElementModelAddress = {
                page: "adjective-phrase",
                name: "item"
            };
            await createModel(address);
            const result = await getModel(address);
            if (!isModelLoaderError(result)) {
                assert.fail();
            }
            assert.deepStrictEqual(result.errType, "internal error");
        });
    });

    describe("updateModel", () => {
        test("standard", async () => {
            clearDirectory();
            const address: ElementModelAddress = {
                page: "adjective-phrase",
                name: "item"
            };
            const blankModel: Model = { diagram: DiagramState.initEmpty() };
            await createModel(address, blankModel);
            let result = await getModel(address);
            assert.deepStrictEqual(result, blankModel);
            const expected: Model = {
                defaultCategory: "sentence",
                diagram: DiagramState.initEmpty()
            };
            await updateModel(address, expected);
            result = await getModel(address);
            assert.deepStrictEqual(result, expected);
        });

        test("error: invalid", async () => {
            clearDirectory();
            const address: ElementModelAddress = {
                page: "adjective-phrase",
                name: "item"
            };
            await createModel(address);
            const result = await updateModel(address, {} as any);
            if (!isModelLoaderError(result)) {
                assert.fail();
            }
            assert.strictEqual(result.errType, "invalid arg");
        });

        test("error: doesn't exist", async () => {
            clearDirectory();
            const address: ElementModelAddress = {
                page: "adjective-phrase",
                name: "item"
            };
            const model: Model = { diagram: DiagramState.initEmpty() };
            const result = await updateModel(address, model);
            if (!isModelLoaderError(result)) {
                assert.fail();
            }
            assert.strictEqual(result.errType, "resource not found");
        });
    });

    test("deleteModel", async () => {
        clearDirectory();
        const address: ElementModelAddress = {
            page: "sentence",
            name: "sentence"
        };
        await createModel(address);
        await deleteModel(address);
        const result = await getModel(address);
        if (!isModelLoaderError(result)) {
            assert.fail();
        }
        assert.strictEqual(result.errType, "resource not found");
    });

    test("renameModel", async () => {
        clearDirectory();
        const address: ElementModelAddress = {
            page: "adjective",
            name: "hello"
        };
        const newAddress: ElementModelAddress = {
            page: "adjective",
            name: "bye-bye"
        };
        const newAddressName = `${newAddress.page}.${newAddress.name}.json`;
        await createModel(address);
        await renameModel(address, newAddress);
        const result = await FileSystem.readdir(root);
        const expected: DirectoryItem = {
            type: "dir",
            fullPath: root,
            name: "test-files",
            children: {
                [newAddressName]: {
                    type: "file",
                    name: newAddressName,
                    extension: ".json",
                    fullPath: nodepath.resolve(root, newAddressName)
                }
            }
        };
        assert.deepStrictEqual(result, expected);
    });
});