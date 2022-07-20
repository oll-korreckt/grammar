import fs from "fs";
import { constants } from "fs";

export async function checkAccess(path: string): Promise<boolean> {
    try {
        await fs.promises.access(path, constants.R_OK | constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

export async function checkReadAccess(path: string): Promise<boolean> {
    try {
        await fs.promises.access(path, constants.R_OK);
        return true;
    } catch {
        return false;
    }
}