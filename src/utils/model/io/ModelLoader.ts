import { ElementPageId } from "@utils/element";
import { Model } from "../types";
import fs from "fs";
import { constants } from "fs";
import { FileItem, FileSystem } from "@utils/io";
import nodepath from "path";

const FILE_IDENTIFIER = ".json";

export interface ModelLoader {
    getModel: (address: ElementModelAddress) => Promise<Model | "no model" | "error">;
    getModelAddresses: () => Promise<ElementModelAddress[] | "error">;
    setModel: (address: ElementModelAddress, model: Model) => Promise<"success" | "invalid" | "error">;
    deleteModel: (address: ElementModelAddress) => Promise<"success" | "error">;
    renameModel: (address: ElementModelAddress, newAddress: ElementModelAddress) => Promise<"success" | "not found" | "invalid arg" | "error">;
}

export interface ElementModelAddress {
    page: ElementPageId;
    name: string;
}

function toString({ page, name }: ElementModelAddress): string {
    return `${page}.${name}`;
}

function sort(a: ElementModelAddress, b: ElementModelAddress): number {
    const aStr = toString(a);
    const bStr = toString(b);
    if (aStr > bStr) {
        return 1;
    } else if (aStr < bStr) {
        return -1;
    } else {
        return 0;
    }
}

export const ElementModelAddress = {
    toString: toString,
    sort: sort
};

function _addressToFilename({ page, name }: ElementModelAddress): string {
    return `${page}.${name}${FILE_IDENTIFIER}`;
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

function getNameWithoutExtension({ extension, name }: FileItem): string {
    const len = name.length - extension.length;
    return name.slice(0, len);
}

async function getModelAddresses(root: string): Promise<ElementModelAddress[] | "error"> {
    if (!await checkAccess(root)) {
        return "error";
    }
    const { children } = await FileSystem.readdir(root);
    if (children === undefined) {
        return [];
    }
    return Object.values(children)
        .filter(FileSystem.isFile)
        .map((child) => {
            const name = getNameWithoutExtension(child);
            const [page, model] = name.split(".");
            return { page: page as ElementPageId, name: model };
        });
}

async function getModel(root: string, address: ElementModelAddress): Promise<Model | "no model" | "error"> {
    if (!await checkAccess(root)) {
        return "error";
    }
    const filename = _addressToFilename(address);
    const path = nodepath.resolve(root, filename);
    if (!await checkAccess(path)) {
        return "no model";
    }
    const buffer = await fs.promises.readFile(path);
    const content = buffer.toString();
    return JSON.parse(content);
}

async function setModel(root: string, address: ElementModelAddress, model: Model): Promise<"success" | "invalid" | "error"> {
    if (!await checkAccess(root)) {
        return "error";
    }
    if (!isModel(model)) {
        return "invalid";
    }
    const filename = _addressToFilename(address);
    const path = nodepath.resolve(root, filename);
    const content = JSON.stringify(model);
    try {
        await fs.promises.writeFile(path, content);
        return "success";
    } catch {
        return "error";
    }
}

async function deleteModel(root: string, address: ElementModelAddress): Promise<"success" | "error"> {
    if (!await checkAccess(root)) {
        return "error";
    }
    const filename = _addressToFilename(address);
    const path = nodepath.resolve(root, filename);
    const fileExists = await checkAccess(path);
    if (!fileExists) {
        return "success";
    }
    try {
        await fs.promises.unlink(path);
        return "success";
    } catch (error) {
        return "error";
    }
}

async function renameModel(root: string, address: ElementModelAddress, newAddress: ElementModelAddress): Promise<"success" | "not found" | "invalid arg" | "error"> {
    if (address.page !== newAddress.page
        || address.name === newAddress.name) {
        return "invalid arg";
    }
    if (!await checkAccess(root)) {
        return "error";
    }
    const currFilename = _addressToFilename(address);
    const currFilepath = nodepath.resolve(root, currFilename);
    const currFileExists = await checkAccess(currFilepath);
    if (!currFileExists) {
        return "not found";
    }
    const newFilename = _addressToFilename(newAddress);
    const newFilepath = nodepath.resolve(root, newFilename);
    const newFileExists = await checkAccess(newFilepath);
    if (newFileExists) {
        return "invalid arg";
    }
    try {
        await fs.promises.rename(currFilepath, newFilepath);
        return "success";
    } catch {
        return "error";
    }
}

export async function checkAccess(path: string): Promise<boolean> {
    try {
        await fs.promises.access(path, constants.R_OK | constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

function createLoader(root: string): ModelLoader {
    return {
        getModelAddresses: async () => await getModelAddresses(root),
        getModel: async (address) => await getModel(root, address),
        setModel: async (address, model) => await setModel(root, address, model),
        deleteModel: async (address) => await deleteModel(root, address),
        renameModel: async (address, newAddress) => await renameModel(root, address, newAddress)
    };
}

export const ModelLoader = {
    createLoader: createLoader
};