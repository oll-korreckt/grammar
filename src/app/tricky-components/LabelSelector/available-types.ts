import { DerivationTree, ElementData } from "@app/utils";
import { ElementCategory, ElementType, elementTypeLists } from "@domain/language";

export type LabelCategory = (keyof DerivationTree) | "coordinated";

export type DeriveData = {
    baseType: Exclude<ElementType, "word">;
    type: Exclude<ElementType, "word">;
    property: string;
}

export type AvailableTypes = {
    [Key in LabelCategory]?: DeriveData[];
}

type PreOutputData = {
    [Key in Exclude<ElementType, "word">]?: {
        baseType: Exclude<ElementType, "word">;
        property: string;
    };
}

type AvailableTypesPreOutput = {
    [Key in keyof AvailableTypes]: PreOutputData;
}

type ElementOrder = {
    [Key in ElementType]: number;
}

const elementOrder = Object.fromEntries(elementTypeLists.element.map((eType, index) => [eType, index])) as ElementOrder;

function storeTreeData(tree: DerivationTree, preOutput: AvailableTypesPreOutput): void {
    Object.entries(tree).forEach(([key, treeItems]) => {
        const castKey = key as keyof AvailableTypes;
        treeItems.forEach(({ primaryType, coordType, baseType }) => {
            if (primaryType !== undefined) {
                if (preOutput[castKey] === undefined) {
                    preOutput[castKey] = {};
                }
                (preOutput[castKey] as PreOutputData)[primaryType.type] = {
                    baseType: baseType,
                    property: primaryType.properties[0]
                };
            }
            if (coordType !== undefined) {
                if (preOutput.coordinated === undefined) {
                    preOutput.coordinated = {};
                }
                preOutput.coordinated[coordType.type] = {
                    baseType: baseType,
                    property: coordType.properties[0]
                };
            }
        });
    });
}

function derive(preOutput: AvailableTypesPreOutput): AvailableTypes {
    const output: AvailableTypes = {};
    Object.entries(preOutput).forEach(([key, data]) => {
        const castKey = key as keyof AvailableTypesPreOutput;
        output[castKey] = Object.entries(data).sort(([type1], [type2]) => {
            const type1Order = elementOrder[type1 as Exclude<ElementType, "word">];
            const type2Order = elementOrder[type2 as Exclude<ElementType, "word">];
            return type1Order - type2Order;
        }).map(([type, { baseType, property }]) => {
            return {
                type: type,
                baseType: baseType,
                property: property
            } as DeriveData;
        });
    });
    return output;
}

function getAvailableTypes(visibleElements: ElementData[]): AvailableTypes {
    const elementTypes = new Set(visibleElements.map((e) => e.type));
    const preOutput: AvailableTypesPreOutput = {};
    elementTypes.forEach((eType) => {
        const tree = DerivationTree.getDerivationTree(eType);
        if (tree !== undefined) {
            storeTreeData(tree, preOutput);
        }
    });
    return derive(preOutput);
}

function _getFirstCategory(availableTypes: AvailableTypes): LabelCategory {
    const categories: LabelCategory[] = [
        "partOfSpeech",
        "phrase",
        "clause",
        "coordinated"
    ];
    for (let index = 0; index < categories.length; index++) {
        const category = categories[index];
        if (availableTypes[category] !== undefined) {
            return category;
        }
    }
    throw "category not found";
}

function _getsearchCategory(elementType: ElementType): LabelCategory {
    if (elementType.startsWith("coordinated")) {
        return "coordinated";
    }
    const output = ElementCategory.getElementCategory(elementType);
    if (output === "word") {
        throw "cannot return word";
    }
    return output;
}

function getSelectedCategory(availableTypes: AvailableTypes, elementType: ElementType | undefined): LabelCategory | undefined {
    if (elementType === undefined) {
        return _getFirstCategory(availableTypes);
    }
    const searchCategory = _getsearchCategory(elementType);
    const deriveData = availableTypes[searchCategory];
    if (deriveData === undefined) {
        return undefined;
    }
    for (let index = 0; index < deriveData.length; index++) {
        const { type } = deriveData[index];
        if (type === elementType) {
            return searchCategory;
        }
    }
    return undefined;
}

export const AvailableTypes = {
    getAvailableTypes: getAvailableTypes,
    getSelectedCategory: getSelectedCategory
};