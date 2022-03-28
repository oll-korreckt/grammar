import { ElementCategory, ElementType, elementTypeLists, getElementDefinition } from "@domain/language";
import { ClauseList, ClauseType, PartOfSpeechList, PartOfSpeechType, PhraseList } from "@domain/language/_types/utils";
import { ElementDisplayInfo } from "./element-display-info";

type AllDerivationTrees = {
    [Key in ElementType]?: DerivationTree;
}

type AllDerivationTreePrecursors = {
    [Key1 in ElementType]: {
        [Key2 in keyof DerivationTree]?: Record<string, DerivationTreeItem>;
    };
}

export type DerivationTree = {
    partOfSpeech?: DerivationTreeItem[];
    phrase?: DerivationTreeItem[];
    clause?: DerivationTreeItem[];
    sentence?: DerivationTreeItem[];
}

export type DerivationTreeItem = {
    baseType: BaseElementType;
    primaryType?: DerivationTarget;
    coordType?: DerivationTarget;
}

export type DerivationTarget = {
    type: Exclude<ElementType, "word">;
    properties: string[];
}

export type BaseElementType = PartOfSpeechList[number] | PhraseList[number] | ClauseList[number];

const mainOrder: PartOfSpeechType[] = [
    "noun",
    "pronoun",
    "verb",
    "determiner",
    "adjective",
    "adverb",
    "preposition",
    "gerund",
    "participle",
    "infinitive",
    "coordinator",
    "subordinator",
    "interjection"
];
const clauseOrder: ClauseType[] = [
    "independent",
    "noun",
    "relative",
    "adverbial"
];

function lowerCase(value: string): string {
    return value[0].toLowerCase() + value.slice(1);
}

function toPhrase(value: PartOfSpeechType): string {
    return `${value}Phrase`;
}

const coordinated = "coordinated";

function removeCoordinated(value: ElementType): BaseElementType {
    const start = coordinated.length;
    return lowerCase(value.slice(start)) as BaseElementType;
}

function isBaseElementType(value: ElementType): value is BaseElementType {
    return value.slice(0, coordinated.length) !== coordinated;
}

function getElementBaseType(value: ElementType): BaseElementType {
    return isBaseElementType(value) ? value : removeCoordinated(value);
}

function storeTarget(type: Exclude<ElementType, "word">, property: string, output: Record<string, DerivationTreeItem>): void {
    const baseType = getElementBaseType(type);
    if (output[baseType] === undefined) {
        output[baseType] = { baseType: baseType };
    }
    const storageItem = output[baseType];
    const location: Exclude<keyof DerivationTreeItem, "baseType"> = isBaseElementType(type)
        ? "primaryType"
        : "coordType";
    if (storageItem[location] === undefined) {
        storageItem[location] = { type: type, properties: [property] };
    } else {
        (storageItem[location] as DerivationTarget).properties.push(property);
    }
}

//#region transformPrecursor
type Order<TKey extends string> = {
    [Key in TKey]: number;
}

function createPartOfSpeechOrder(): Order<PartOfSpeechType> {
    const output: Record<string, number> = {};
    let count = 0;
    mainOrder.forEach((pos) => {
        output[pos] = count++;
    });
    return output as ReturnType<typeof createPartOfSpeechOrder>;
}

function createPhraseOrder(): Order<PhraseList[number]> {
    const phraseSet = new Set(elementTypeLists.phrase) as Set<string>;
    const output: Record<string, number> = {};
    let count = 0;
    mainOrder.forEach((pos) => {
        const phrase = toPhrase(pos);
        if (phraseSet.has(phrase)) {
            output[phrase] = count++;
        }
    });
    return output as ReturnType<typeof createPhraseOrder>;
}

function createClauseOrder(): Order<ClauseList[number]> {
    const output: Record<string, number> = {};
    let count = 0;
    clauseOrder.forEach((clause) => {
        output[clause] = count++;
    });
    return output as ReturnType<typeof createClauseOrder>;
}

function createSorter(order: Record<string, number>): (a: DerivationTreeItem, b: DerivationTreeItem) => number {
    return (a, b) => {
        const aVal = order[a.baseType];
        const bVal = order[b.baseType];
        return aVal - bVal;
    };
}

function transformPrecursor(precursor: AllDerivationTreePrecursors): AllDerivationTrees {
    const output: Partial<AllDerivationTrees> = {};
    const posSorter = createSorter(createPartOfSpeechOrder());
    const phraseSorter = createSorter(createPhraseOrder());
    const clauseSorter = createSorter(createClauseOrder());
    Object.entries(precursor).forEach(([eType, element]) => {
        const outputElement: DerivationTree = {};
        if (element.partOfSpeech !== undefined) {
            outputElement.partOfSpeech = Object.values(element.partOfSpeech).sort(posSorter);
        }
        if (element.phrase !== undefined) {
            outputElement.phrase = Object.values(element.phrase).sort(phraseSorter);
        }
        if (element.clause !== undefined) {
            outputElement.clause = Object.values(element.clause).sort(clauseSorter);
        }
        if (element.sentence !== undefined) {
            outputElement.sentence = Object.values(element.sentence);
        }
        output[eType as keyof AllDerivationTreePrecursors] = outputElement;
    });
    return output as AllDerivationTrees;
}
//#endregion

function assignPropertyTypes(elementType: Exclude<ElementType, "word">, requiredProperties: [string, ElementType[]][], output: Partial<AllDerivationTreePrecursors>): void {
    const baseType = getElementBaseType(elementType);
    const category = ElementCategory.getElementCategory(baseType) as Exclude<ElementCategory, "word">;
    requiredProperties.forEach(([property, propertyTypes]) => {
        propertyTypes.forEach((pType) => {
            if (output[pType] === undefined) {
                output[pType] = {};
            }
            const element = output[pType] as AllDerivationTreePrecursors[keyof AllDerivationTreePrecursors];
            if (element[category] === undefined) {
                element[category] = {};
            }
            const categoryObj = element[category] as Record<string, DerivationTreeItem>;
            storeTarget(elementType, property, categoryObj);
        });
    });
}

function createDerivationTree(): AllDerivationTrees {
    const precursor:  Partial<AllDerivationTreePrecursors> = {};
    elementTypeLists.element.slice(1).forEach((eType) => {
        const def = getElementDefinition(eType as Exclude<ElementType, "word">);
        const { properties } = ElementDisplayInfo.getDisplayInfo(eType);
        const reqPropTypes: [string, ElementType[]][] = [];
        Object.entries(properties).filter(([, { required }]) => required).forEach(([property]) => {
            const [, propTypes] = def[property];
            reqPropTypes.push([property, propTypes]);
        });
        assignPropertyTypes(
            eType as Exclude<ElementType, "word">,
            reqPropTypes,
            precursor
        );
    });
    return transformPrecursor(precursor as AllDerivationTreePrecursors);
}

const derivationTree = createDerivationTree();

function getDerivationTree(type: ElementType): DerivationTree | undefined {
    return derivationTree[type];
}

export const DerivationTree = {
    getDerivationTree: getDerivationTree
};