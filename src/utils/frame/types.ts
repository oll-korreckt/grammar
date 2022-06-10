import { EditFormFrameRenderProps } from "@app/tricky-components/EditFormFrameRender";
import { validAddressChars } from "@utils/api";

export interface FrameAddress {
    name: string;
    index: number;
}

export interface Frame {
    title?: string;
    duration: number;
    data: EditFormFrameRenderProps;
}

function isValid(address: FrameAddress): boolean {
    const { name, index } = address;
    if (!validAddressChars(name)) {
        return false;
    }
    if (!isValidIndex(index)) {
        return false;
    }
    return true;
}

function isValidName(name: string): boolean {
    return validAddressChars(name);
}

function isValidIndex(index: number): boolean {
    return index >= 0;
}

function toString(address: FrameAddress): string {
    if (!isValid(address)) {
        throw `Received invalid address '${JSON.stringify(address)}'`;
    }
    const { name, index } = address;
    return `${name}.${index}`;
}

function _fromString(address: string[]): FrameAddress {
    const errMsg = `Address '${JSON.stringify(address)}' is not of format <name>.<index>`;
    if (address.length !== 2) {
        throw errMsg;
    }
    const [name, indexStr] = address;
    const index = parseInt(indexStr);
    const output: FrameAddress = { name, index };
    if (!isValid(output)) {
        throw errMsg;
    }
    return output;
}

function fromString(address: string | [string, string]): FrameAddress {
    if (Array.isArray(address)) {
        return _fromString(address);
    }
    const parts = address.split(".");
    return _fromString(parts);
}

export const FrameAddress = {
    toString: toString,
    fromString: fromString,
    isValidIndex: isValidIndex,
    isValidName: isValidName,
    isValid: isValid
};