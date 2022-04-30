import { ElementModelAddress, ModelLoader } from "../ModelLoader";
import path from "path";
import { assert } from "chai";
import fs from "fs";
import { DirectoryItem, FileSystem } from "@utils/io";
import { Model } from "@utils/model/types";
import { DiagramState } from "@app/utils";
import nodepath from "path";

describe("ModelLoader", () => {
    const root = path.resolve(__dirname, "test-files");
    const {
        getModelAddresses,
        getModel,
        setModel,
        renameModel,
        deleteModel
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

    test("getModelAddresses", async () => {
        clearDirectory();
        const expected: ElementModelAddress[] = [
            { page: "adjective", name: "model1" },
            { page: "adjective-phrase", name: "model2" }
        ];
        expected.forEach((address) => createModel(address));
        const result = await getModelAddresses();
        if (result === "error") {
            throw result;
        }
        result.sort(ElementModelAddress.sort);
        expected.sort(ElementModelAddress.sort);
        assert.deepStrictEqual(result, expected);
    });

    test("getModelAddresses: general + specific", async () => {
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
        const blankModel: Model = {
            defaultCategory: "sentence",
            diagram: DiagramState.initEmpty()
        };
        await setModel(address1, blankModel);
        await setModel(address2, blankModel);
        await setModel(address3, blankModel);
        const result1 = await getModelAddresses("adjective");
        if (result1 === "error") {
            throw result1;
        }
        const expected1 = [address1, address2];
        assert.deepStrictEqual(
            result1.sort(ElementModelAddress.sort),
            expected1.sort(ElementModelAddress.sort)
        );
        const result2 = await getModelAddresses("adverb");
        if (result2 === "error") {
            throw result2;
        }
        assert.deepStrictEqual(result2, []);
        const result3 = await getModelAddresses();
        if (result3 === "error") {
            throw result3;
        }
        const expected3 = [address1, address2, address3];
        assert.deepStrictEqual(
            result3.sort(ElementModelAddress.sort),
            expected3.sort(ElementModelAddress.sort)
        );
    });

    test("setModel + getModel", async () => {
        clearDirectory();
        const address: ElementModelAddress = {
            page: "adjective-phrase",
            name: "item"
        };
        const expected: Model = {
            defaultCategory: "sentence",
            diagram: DiagramState.initEmpty()
        };
        await setModel(address, expected);
        const result = await getModel(address);
        assert.deepStrictEqual(result, expected);
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
        assert.strictEqual(result, "no model");
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