import { FileSystem } from "..";
import nodepath from "path";
import { DirectoryItem, FileItem } from "../FileSystem";
import { assert } from "chai";

interface TestDirectoryItem extends Omit<DirectoryItem, "fullPath" | "children"> {
    children?: Record<string, TestFileItem | TestDirectoryItem>;
}

type TestFileItem = Omit<FileItem, "fullPath">;

function stripFileOutput(data: FileItem): TestFileItem {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fullPath, ...rest } = data;
    return rest;
}

function stripDirOutput(data: DirectoryItem): TestDirectoryItem {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fullPath, children, ...rest } = data;
    const output: TestDirectoryItem = rest;
    if (children !== undefined) {
        const childrenOutput: Required<TestDirectoryItem>["children"] = {};
        Object.entries(children).forEach(([key, child]) => {
            if (child.type === "file") {
                childrenOutput[key] = stripFileOutput(child);
            } else if (child.type === "dir") {
                childrenOutput[key] = stripDirOutput(child);
            }
        });
        output.children = childrenOutput;
    }
    return output;
}

describe("FileSystem", () => {
    const testFiles = nodepath.resolve(__dirname, "test-files");

    test("readdir", async () => {
        const result = stripDirOutput(await FileSystem.readdir(testFiles));
        const expected: TestDirectoryItem = {
            type: "dir",
            name: "test-files",
            children: {
                "dir1": {
                    type: "dir",
                    name: "dir1",
                    children: {
                        "subdir": {
                            type: "dir",
                            name: "subdir",
                            children: {
                                "file1.css": {
                                    type: "file",
                                    name: "file1.css",
                                    extension: ".css"
                                },
                                "file2.model.json": {
                                    type: "file",
                                    name: "file2.model.json",
                                    extension: ".json"
                                }
                            }
                        },
                        "what.txt": {
                            type: "file",
                            name: "what.txt",
                            extension: ".txt"
                        }
                    }
                },
                "dir2": {
                    type: "dir",
                    name: "dir2"
                },
                "file1.txt": {
                    type: "file",
                    name: "file1.txt",
                    extension: ".txt"
                },
                "file2.module.scss": {
                    type: "file",
                    name: "file2.module.scss",
                    extension: ".scss"
                },
                "file3.json": {
                    type: "file",
                    name: "file3.json",
                    extension: ".json"
                }
            }
        };
        assert.deepStrictEqual(result, expected);
    });

    test("walkdir", async () => {
        const data = await FileSystem.readdir(testFiles);
        const result = FileSystem.walkdir(data).map(({ name }) => name).sort();
        const expected: string[] = [
            "dir1",
            "subdir",
            "file1.css",
            "file2.model.json",
            "what.txt",
            "dir2",
            "file1.txt",
            "file2.module.scss",
            "file3.json"
        ].sort();
        assert.deepStrictEqual(result, expected);
    });
});