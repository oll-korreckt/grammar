import { ElementPageType } from "./types";
import fs from "fs";
import path from "path";

const filePathObject: Record<string, string> = {};

function _setValue(key: string, value: string): void {
    if (key in filePathObject) {
        throw `Key '${key}' appears twice`;
    }
    filePathObject[key] = value;
}

function _fillFilePathObject(dirPath: string): void {
    const dirContents = fs.readdirSync(dirPath);
    for (let index = 0; index < dirContents.length; index++) {
        const item = dirContents[index];
        const itemPath = path.resolve(dirPath, item);
        const itemStat = fs.lstatSync(itemPath);
        if (itemStat.isDirectory()) {
            _fillFilePathObject(itemPath);
        } else if (itemStat.isFile()) {
            const ext = path.extname(itemPath);
            const fileName = path.basename(itemPath);
            const key = fileName.slice(0, fileName.length - ext.length);
            _setValue(key, itemPath);
        }
    }
}

function findFile(type: ElementPageType): string {
    if (Object.keys(filePathObject).length === 0) {
        const basePath = path.resolve("src", "markdown", "info", "elements");
        _fillFilePathObject(basePath);
    }
    return filePathObject[type];
}

export const MarkdownFinder = {
    findFile: findFile
};