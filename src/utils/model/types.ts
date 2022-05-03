import { DiagramState } from "@app/utils";
import { ElementCategory, ElementId } from "@domain/language";
import { Strings } from "@lib/utils";
import { ElementPage, ElementPageId } from "@utils/element";

export interface Model {
    defaultCategory?: ElementCategory;
    defaultElement?: ElementId;
    diagram: DiagramState;
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

function isValid(address: ElementModelAddress): boolean {
    const { page, name } = address;
    if (!ElementPage.isPageId(page)) {
        return false;
    }
    for (let index = 0; index < name.length; index++) {
        const char = name[index];
        if (char === "_"
            || char === "-"
            || Strings.isEnglishLetterChar(char)
            || Strings.isNumericChar(char)) {
            continue;
        }
        return false;
    }
    return true;
}

export const ElementModelAddress = {
    toString: toString,
    sort: sort,
    isValid: isValid
};