import { checkAccess, checkReadAccess } from "@utils/api/io";
import { FileSystem } from "@utils/io";
import { Frame, FrameAddress } from "../types";
import fs from "fs";
import nodepath from "path";

export type FrameLoaderErrorType =
    | "internal error"
    | "resource conflict"
    | "resource not found"
    | "argument error";

export interface FrameErrorBase {
    errType: string;
    msg: string;
}

export const FrameError = {
    isFrameError(value: any): value is FrameErrorBase {
        return typeof value === "object"
            && "errType" in value
            && "msg" in value;
    }
};
export interface FrameError<TError extends FrameLoaderErrorType> extends FrameErrorBase {
    errType: TError;
}

type PutFrameOutput =
    | "success"
    | FrameError<"internal error">
    | FrameError<"resource conflict">
    | FrameError<"resource not found">;

export interface FrameLoader {
    postFrame: (name: string, frame: Frame) => Promise<PostFrameOutput>;
    putFrame: (address: FrameAddress, frame: Frame) => Promise<PutFrameOutput>;
    getFrames: (name: string) => Promise<GetFramesOutput>;
}

const FILE_IDENTIFIER = ".json";

function _addressToFilename(address: FrameAddress): string {
    return FrameAddress.toString(address) + FILE_IDENTIFIER;
}

async function putFrame(root: string, address: FrameAddress, frame: Frame): Promise<PutFrameOutput> {
    if (!await checkAccess(root)) {
        return {
            errType: "internal error",
            msg: `Unable to access '${root}'`
        };
    }
    const filename = _addressToFilename(address);
    const path = nodepath.resolve(root, filename);
    const fileExists = await checkAccess(path);
    if (!fileExists) {
        return {
            errType: "resource conflict",
            msg: `Resource for '${FrameAddress.toString(address)}' already exists`
        };
    }
    const content = JSON.stringify(frame);
    try {
        await fs.promises.writeFile(path, content);
        return "success";
    } catch {
        return {
            errType: "internal error",
            msg: `Unable to write to '${filename}'`
        };
    }
}

type PostFrameOutput =
    | FrameAddress
    | FrameError<"internal error">
    | FrameError<"resource conflict">
    | FrameError<"argument error">;

async function getIndex(root: string, recName: string): Promise<number> {
    let output = 0;
    const { children } = await FileSystem.readdir(root);
    if (children === undefined) {
        return output;
    }
    const values = Object.values(children);
    for (let index = 0; index < values.length; index++) {
        const value = values[index];
        if (value.type === "dir") {
            continue;
        }
        const { name, extension } = value;
        if (value.extension !== FILE_IDENTIFIER) {
            continue;
        }
        const withoutExt = name.substring(0, name.length - extension.length);
        const fileRecName = FrameAddress.fromString(withoutExt).name;
        if (fileRecName === recName) {
            output++;
        }
    }
    return output;
}

function _createAccessErr(root: string, itemType?: "directory" | "file"): FrameError<"internal error"> {
    const defItemType: "directory" | "file" = itemType ? itemType : "directory";
    return {
        errType: "internal error",
        msg: `Unable to access ${defItemType}: ${root}`
    };
}

async function postFrame(root: string, name: string, frame: Frame): Promise<PostFrameOutput> {
    if (!FrameAddress.isValidName(name)) {
        return {
            errType: "argument error",
            msg: `'${name}' is not a valid name`
        };
    }
    if (!await checkAccess(root)) {
        return _createAccessErr(root);
    }
    const index = await getIndex(root, name);
    const output: FrameAddress = { name, index };
    if (!FrameAddress.isValid(output)) {
        return {
            errType: "internal error",
            msg: `Invalid address computed for '${name}'`
        };
    }
    const filename = _addressToFilename(output);
    const path = nodepath.resolve(root, filename);
    const exists = await checkAccess(path);
    if (exists) {
        return {
            errType: "resource conflict",
            msg: `Frame for '${FrameAddress.toString(output)}' already exists`
        };
    }
    const content = JSON.stringify(frame);
    try {
        await fs.promises.writeFile(path, content);
        return output;
    } catch {
        return {
            errType: "internal error",
            msg: `Unable to write to '${path}'`
        };
    }
}

type GetFramesOutput =
    | Frame[]
    | FrameError<"internal error">
    | FrameError<"resource not found">

async function getFrames(root: string, frameName: string): Promise<GetFramesOutput> {
    if (!await checkReadAccess(root)) {
        return _createAccessErr(root, "directory");
    }
    const { children } = await FileSystem.readdir(root);
    const noResourceMsg = `No resource(s) found for '${frameName}'`;
    if (children === undefined) {
        return {
            errType: "resource not found",
            msg: noResourceMsg
        };
    }
    interface PreOutput {
        index: number;
        frame: Frame;
    }
    const output: PreOutput[] = [];
    const items = Object.values(children);
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (item.type === "dir") {
            continue;
        }
        const { name, extension, fullPath } = item;
        const buffer = await fs.promises.readFile(fullPath);
        const content = buffer.toString();
        const frame: Frame = JSON.parse(content);
        const addressStr = name.slice(0, name.length - extension.length);
        const address = FrameAddress.fromString(addressStr);
        output.push({
            index: address.index,
            frame: frame
        });
    }
    return output.sort((a, b) => a.index - b.index).map(({ frame }) => frame);
}

function createLoader(root: string): FrameLoader {
    return {
        putFrame: async (address, frame) => await putFrame(root, address, frame),
        postFrame: async (address, frame) => await postFrame(root, address, frame),
        getFrames: async (name) => await getFrames(root, name)
    };
}

export const FrameLoader = {
    createLoader: createLoader
};