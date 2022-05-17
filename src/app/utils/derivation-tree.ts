import { ElementType, elementTypeLists, getElementDefinition } from "@domain/language";
import { ElementDisplayInfo } from "./element-display-info";


interface ElementChecker {
    type: Exclude<ElementType, "word">;
    isPossible: PossibleFunction;
}

type AvailableFunction = (type: ElementType) => boolean;
type PossibleFunction = (isAvailable: AvailableFunction) => boolean;

const checkers = createCheckers();

function createCheckers(): ElementChecker[] {
    const output: ElementChecker[] = [];
    for (let index = 0; index < elementTypeLists.element.length; index++) {
        const element = elementTypeLists.element[index];
        if (element === "word") {
            continue;
        }
        const checker = createChecker(element);
        output.push(checker);
    }
    return output;
}

function createChecker(type: Exclude<ElementType, "word">): ElementChecker {
    const def = getElementDefinition(type);
    const { properties } = ElementDisplayInfo.getDisplayInfo(type);
    const entries = Object.entries(properties);
    const requiredProps: ElementType[][] = [];
    for (let index = 0; index < entries.length; index++) {
        const [key, propInfo] = entries[index];
        if (propInfo.required !== true) {
            continue;
        }
        if (!(key in def)) {
            throw `Element '${type}' does not contain a key for '${key}' in its definition`;
        }
        const [, acceptedTypes] = def[key];
        requiredProps.push(acceptedTypes);
    }
    return {
        type: type,
        isPossible: createPossibleFn(requiredProps)
    };
}

function createPossibleFn(requiredProps: ElementType[][]): PossibleFunction {
    return (isAvailable) => {
        for (let i = 0; i < requiredProps.length; i++) {
            const elements = requiredProps[i];
            let hasValidElement = false;
            for (let j = 0; j < elements.length; j++) {
                const element = elements[j];
                if (isAvailable(element)) {
                    hasValidElement = true;
                    break;
                }
            }
            if (!hasValidElement) {
                return false;
            }
        }
        return true;
    };
}

function createAvailableFn(available: ElementType[]): AvailableFunction {
    const availSet = new Set<ElementType>(available);
    return (type) => availSet.has(type);
}

function getElements(available: ElementType[]): Exclude<ElementType, "word">[] {
    const availFn = createAvailableFn(available);
    return checkers
        .filter(({ isPossible }) => isPossible(availFn))
        .map(({ type }) => type);
}

export const DerivationTree = {
    getElements: getElements
};