import { ElementPageId } from "@utils/element";
import { Model, ElementModelAddress } from "../types";
import fs from "fs";
import { constants } from "fs";
import { FileItem, FileSystem } from "@utils/io";
import nodepath from "path";
import { DiagramState } from "@app/utils";
import { checkReadAccess } from "@utils/api/io";

const FILE_IDENTIFIER = ".json";

export type ModelLoaderErrorType =
    | "invalid arg"
    | "internal error"
    | "resource not found"
    | "resource conflict";
export interface ModelLoaderErrorBase {
    errType: string;
    msg: string;
}
export interface ModelLoaderError<TError extends ModelLoaderErrorType> extends ModelLoaderErrorBase {
    errType: TError;
}

type GetModelOutput =
    | Model
    | ModelLoaderError<"invalid arg">
    | ModelLoaderError<"resource not found">
    | ModelLoaderError<"internal error">;
type GetModelAddressesOutput =
    | ElementModelAddress[]
    | ModelLoaderError<"internal error">;
type UpdateModelOutput =
    | "success"
    | ModelLoaderError<"resource not found">
    | ModelLoaderError<"invalid arg">
    | ModelLoaderError<"internal error">;
type DeleteModelOutput =
    | "success"
    | ModelLoaderError<"internal error">;
type AddModelOutput =
    | "success"
    | ModelLoaderError<"resource conflict">
    | ModelLoaderError<"internal error">;
type RenameModelOutput =
    | "success"
    | ModelLoaderError<"resource not found">
    | ModelLoaderError<"resource conflict">
    | ModelLoaderError<"invalid arg">
    | ModelLoaderError<"internal error">;

export function isModelLoaderError(value: any): value is ModelLoaderErrorBase {
    return typeof value === "object"
        && "errType" in value
        && "msg" in value;
}

export interface ModelLoader {
    getModel: (address: ElementModelAddress) => Promise<GetModelOutput>;
    getModelAddresses: (page?: ElementPageId) => Promise<GetModelAddressesOutput>;
    updateModel: (address: ElementModelAddress, model: Model) => Promise<UpdateModelOutput>;
    deleteModel: (address: ElementModelAddress) => Promise<DeleteModelOutput>;
    addModel: (address: ElementModelAddress, model?: Model) => Promise<AddModelOutput>;
    renameModel: (address: ElementModelAddress, newAddress: ElementModelAddress) => Promise<RenameModelOutput>;
}

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

function _createAccessErr(root: string, itemType?: "directory" | "file"): ModelLoaderError<"internal error"> {
    const defItemType: "directory" | "file" = itemType ? itemType : "directory";
    return {
        errType: "internal error",
        msg: `Unable to access ${defItemType}: ${root}`
    };
}

function _createResourceNotFoundErr(address: ElementModelAddress): ModelLoaderError<"resource not found"> {
    return {
        errType: "resource not found",
        msg: `No resource for '${ElementModelAddress.toString(address)}'`
    };
}

function getNameWithoutExtension({ extension, name }: FileItem): string {
    const len = name.length - extension.length;
    return name.slice(0, len);
}

async function getModelAddresses(root: string, page?: ElementPageId): Promise<GetModelAddressesOutput> {
    if (!await checkAccess(root)) {
        return _createAccessErr(root);
    }
    const { children } = await FileSystem.readdir(root);
    if (children === undefined) {
        return [];
    }
    const items = Object.values(children);
    const output: ElementModelAddress[] = [];
    for (let index = 0; index < items.length; index++) {
        const child = items[index];
        if (child.type !== "file") {
            continue;
        }
        const name = getNameWithoutExtension(child);
        const [pageId, model] = name.split(".");
        if (page === undefined || page === pageId) {
            output.push({
                page: pageId as ElementPageId,
                name: model
            });
        }
    }
    return output;
}

async function getModel(root: string, address: ElementModelAddress): Promise<GetModelOutput> {
    if (!await checkReadAccess(root)) {
        return _createAccessErr(root);
    }
    const filename = _addressToFilename(address);
    const path = nodepath.resolve(root, filename);
    if (!await checkReadAccess(path)) {
        return {
            errType: "resource not found",
            msg: `No model for '${ElementModelAddress.toString(address)}'`
        };
    }
    const buffer = await fs.promises.readFile(path);
    const content = buffer.toString();
    try {
        const output = JSON.parse(content);
        return output;
    } catch {
        return {
            errType: "internal error",
            msg: `Error parsing ${path}`
        };
    }
}

async function updateModel(root: string, address: ElementModelAddress, model: Model): Promise<UpdateModelOutput> {
    if (!await checkAccess(root)) {
        return _createAccessErr(root);
    }
    if (!isModel(model)) {
        return {
            errType: "invalid arg",
            msg: "did not receive valid model argument"
        };
    }
    const filename = _addressToFilename(address);
    const path = nodepath.resolve(root, filename);
    const exists = await checkAccess(path);
    if (!exists) {
        return _createResourceNotFoundErr(address);
    }
    const content = JSON.stringify(model);
    try {
        await fs.promises.writeFile(path, content);
        return "success";
    } catch {
        return {
            errType: "internal error",
            msg: `Error writing to file ${path}`
        };
    }
}

async function deleteModel(root: string, address: ElementModelAddress): Promise<DeleteModelOutput> {
    if (!await checkAccess(root)) {
        return _createAccessErr(root);
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
    } catch {
        return {
            errType: "internal error",
            msg: `Unable to delete file ${path}`
        };
    }
}

async function renameModel(root: string, address: ElementModelAddress, newAddress: ElementModelAddress): Promise<RenameModelOutput> {
    if (!await checkAccess(root)) {
        return _createAccessErr(root);
    }
    const currFilename = _addressToFilename(address);
    const currFilepath = nodepath.resolve(root, currFilename);
    const currFileExists = await checkAccess(currFilepath);
    if (!currFileExists) {
        return _createResourceNotFoundErr(address);
    }
    const newFilename = _addressToFilename(newAddress);
    const newFilepath = nodepath.resolve(root, newFilename);
    const newFileExists = await checkAccess(newFilepath);
    if (newFileExists) {
        const addStr = ElementModelAddress.toString(address);
        const newAddStr = ElementModelAddress.toString(newAddress);
        return {
            errType: "resource conflict",
            msg: `Cannot rename '${addStr}' to '${newAddStr}' as '${newAddStr}' already exists`
        };
    }
    try {
        await fs.promises.rename(currFilepath, newFilepath);
        return "success";
    } catch {
        return {
            errType: "internal error",
            msg: `Unable to rename file ${currFilename} to ${newFilename}`
        };
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

export async function addModel(root: string, address: ElementModelAddress, model?: Model): Promise<AddModelOutput> {
    if (!await checkAccess(root)) {
        return _createAccessErr(root);
    }
    const filename = _addressToFilename(address);
    const filepath = nodepath.resolve(root, filename);
    const fileExists = await checkAccess(filepath);
    if (fileExists) {
        return {
            errType: "resource conflict",
            msg: `Resource for '${ElementModelAddress.toString(address)}' already exists`
        };
    }
    const defModel: Model = model
        ? model
        : { diagram: DiagramState.initEmpty() };
    const content = JSON.stringify(defModel);
    try {
        await fs.promises.writeFile(filepath, content);
        return "success";
    } catch {
        return {
            errType: "internal error",
            msg: `Unable to write to ${filename}`
        };
    }
}

function createLoader(root: string): ModelLoader {
    return {
        getModelAddresses: async (page) => await getModelAddresses(root, page),
        getModel: async (address) => await getModel(root, address),
        updateModel: async (address, model) => await updateModel(root, address, model),
        addModel: async (address, model) => await addModel(root, address, model),
        deleteModel: async (address) => await deleteModel(root, address),
        renameModel: async (address, newAddress) => await renameModel(root, address, newAddress)
    };
}

export const ModelLoader = {
    createLoader: createLoader
};