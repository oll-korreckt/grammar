import { Path } from "slate";

export interface KeyParts {
    path: Path;
    index: number;
}

type SortOutput = -1 | 0 | 1;

function compare(a: number, b: number): SortOutput {
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    }
    return 0;
}

function sortPaths(pathA: Path, pathB: Path): SortOutput {
    const length = Math.min(pathA.length, pathB.length);
    for (let i = 0; i < length; i++) {
        const a = pathA[i];
        const b = pathB[i];
        const diff = compare(a, b);
        if (diff !== 0) {
            return diff;
        }
    }
    return compare(pathA.length, pathB.length);
}

export const ErrorKey = {
    createPathKey(path: Path): string {
        if (path.length === 0) {
            throw "cannot work with empty path";
        }
        let output = "";
        path.forEach((v, i) => {
            if (i > 0) {
                output += " ";
            }
            output += v.toString();
        });
        return output;
    },

    init(path: Path | string, index: number): string {
        if (path.length === 0) {
            throw "cannot work with empty path";
        }
        const pathKey: string = Array.isArray(path)
            ? ErrorKey.createPathKey(path)
            : path;
        return `${pathKey} | ${index}`;
    },

    getKeyParts(key: string): KeyParts {
        const [pathStr, indexStr] = key.split(" | ");
        const path = pathStr.split(" ").map((v) => parseInt(v));
        const index = parseInt(indexStr);
        return { path, index };
    },

    sortMethod(keyA: string, keyB: string): SortOutput {
        const aParts = ErrorKey.getKeyParts(keyA);
        const bParts = ErrorKey.getKeyParts(keyB);
        const pathSort = sortPaths(aParts.path, bParts.path);
        return pathSort === 0
            ? compare(aParts.index, bParts.index)
            : pathSort;
    }
};