import { GeometricObject, GeometricType } from "./types";

function isGeometricObject(value: any): value is GeometricObject {
    return value !== null
        && typeof value === "object"
        && value.geometricType !== undefined;
}

function createTypeGuard<TGeometricObject extends GeometricObject>(...types: GeometricType[]): (value: any) => value is TGeometricObject {
    const output = (value: any): value is TGeometricObject => {
        if (!isGeometricObject(value)) {
            return false;
        }
        return types.includes(value.geometricType);
    };
    return output;
}

function equalTo(value1: number, value2: number): boolean {
    return Math.abs(value1 - value2) <= 0.000000000001;
}

function notEqualTo(value1: number, value2: number): boolean {
    return !equalTo(value1, value2);
}

function greaterThan(value1: number, value2: number): boolean {
    return value1 > value2 && !equalTo(value1, value2);
}

function greaterThanOrEqualTo(value1: number, value2: number): boolean {
    return value1 > value2 || equalTo(value1, value2);
}

function lessThan(value1: number, value2: number): boolean {
    return value1 < value2 && !equalTo(value1, value2);
}

function lessThanOrEqualTo(value1: number, value2: number): boolean {
    return value1 < value2 || equalTo(value1, value2);
}

export const Utils = {
    createTypeGuard: createTypeGuard,
    equalTo: equalTo,
    notEqualTo: notEqualTo,
    greaterThan: greaterThan,
    greaterThanOrEqualTo: greaterThanOrEqualTo,
    lessThan: lessThan,
    lessThanOrEqualTo: lessThanOrEqualTo
};