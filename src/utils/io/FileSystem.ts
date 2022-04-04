import nodepath from "path";
import fs from "fs";


interface Base {
    name: string;
    fullPath: string;
}

export interface FileItem extends Base {
    type: "file";
    extension: string;
}

export interface DirectoryItem extends Base {
    type: "dir";
    children?: Record<string, FileItem | DirectoryItem>;
}

function createFileItem(path: string): FileItem {
    return {
        type: "file",
        name: nodepath.basename(path),
        extension: nodepath.extname(path),
        fullPath: path
    };
}

async function readdir(path: string): Promise<DirectoryItem> {
    const output: DirectoryItem = {
        type: "dir",
        name: nodepath.basename(path),
        fullPath: path
    };
    const children = await fs.promises.readdir(path, { withFileTypes: true });
    const childrenOutput: Required<DirectoryItem>["children"] = {};
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        const childPath = nodepath.resolve(path, child.name);
        if (child.isFile()) {
            childrenOutput[child.name] = createFileItem(childPath);
        } else if (child.isDirectory()) {
            childrenOutput[child.name] = await readdir(childPath);
        } else {
            throw `Unexpected item in directory: '${childPath}'`;
        }
    }
    if (children.length > 0) {
        output.children = childrenOutput;
    }
    return output;
}

function readdirSync(path: string): DirectoryItem {
    const output: DirectoryItem = {
        type: "dir",
        name: nodepath.basename(path),
        fullPath: path
    };
    const children = fs.readdirSync(path, { withFileTypes: true });
    const childrenOutput: Required<DirectoryItem>["children"] = {};
    for (let index = 0; index < children.length; index++) {
        const child = children[index];
        const childPath = nodepath.resolve(path, child.name);
        if (child.isFile()) {
            childrenOutput[child.name] = createFileItem(childPath);
        } else if (child.isDirectory()) {
            childrenOutput[child.name] = readdirSync(childPath);
        } else {
            throw `Unexpected item in directory: '${childPath}'`;
        }
    }
    if (children.length > 0) {
        output.children = childrenOutput;
    }
    return output;
}

function walkdir({ children }: DirectoryItem): (FileItem | DirectoryItem)[] {
    const output: (FileItem | DirectoryItem)[] = [];
    if (children !== undefined) {
        Object.values(children).forEach((child) => {
            output.push(child);
            if (child.type === "dir") {
                const newChildren = walkdir(child);
                output.push(...newChildren);
            }
        });
    }
    return output;
}

export const FileSystem = {
    readdir: readdir,
    readdirSync: readdirSync,
    walkdir: walkdir
};