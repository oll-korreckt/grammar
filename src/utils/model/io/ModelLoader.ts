import { ElementPage, ElementPageId } from "@utils/element";
import { Model } from "../types";
import { promises as fs } from "fs";
import { FileSystem } from "@utils/io";

const FILE_IDENTIFIER = ".model.json";

export type ModelLoader = (page: ElementPageId, model: string) => Promise<Model | "no model" | "invalid model">;

type Cache = Record<string, string>;

function _getKeyFromFilename(filename: string): string {
    const end = filename.length - FILE_IDENTIFIER.length;
    const section = filename.slice(0, end);
    const sections = section.split(".");
    if (sections.length !== 2) {
        throw `Unexpected filename format: '${filename}'`;
    }
    const [pageType, model] = sections;
    if (!ElementPage.isPageType(pageType)) {
        throw `Filename '${filename}' does not contain a valid page type`;
    }
    const pageId = ElementPage.typeToId(pageType);
    return `${pageId}.${model}`;
}

async function _createCache(root: string): Promise<Cache> {
    const output: Cache = {};
    const dirItems = FileSystem.walkdir(await FileSystem.readdir(root));
    for (let index = 0; index < dirItems.length; index++) {
        const item = dirItems[index];
        if (item.type === "file" && item.name.endsWith(FILE_IDENTIFIER)) {
            const key = _getKeyFromFilename(item.name);
            output[key] = item.fullPath;
        }
    }
    return output;
}

function isModel(value: any): value is Model {
    if (typeof value !== "object") {
        return false;
    }
    if ("diagram" in value === false) {
        return false;
    }
    const keys = Object.keys(value);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        switch (key) {
            case "diagram":
            case "defaultElement":
            case "defaultCategory":
                // do nothing
                break;
            default:
                return false;
        }
    }
    return true;
}

async function createLoader(root: string): Promise<ModelLoader> {
    const cache = await _createCache(root);
    return async (page, model) => {
        const key = `${page}.${model}`;
        const filepath = cache[key];
        if (filepath === undefined) {
            return "no model";
        }
        const buffer = await fs.readFile(filepath);
        const content = buffer.toString();
        if (content.length === 0) {
            return "invalid model";
        }
        const output = JSON.parse(content);
        if (!isModel(output)) {
            return "invalid model";
        }
        return output;
    };
}

export const ModelLoader = {
    createLoader: createLoader
};