import { ElementDisplayInfo } from "@app/utils";
import { ElementCategory } from "@domain/language";
import { ClauseList, ElementType, PartOfSpeechList, PhraseList } from "@domain/language/_types/utils";
import { HTMLAnchorObject, HTMLCodeObject, Strings } from "@lib/utils";

export type ElementPageType =
    | "coordinated"
    | PartOfSpeechList[number]
    | PhraseList[number]
    | ClauseList[number]
    | ElementCategory

export type MarkdownPageType = ElementPageType | "index";

export type ElementPageType_ElementType =
    | PartOfSpeechList[number]
    | PhraseList[number]
    | ClauseList[number]

export type ElementPageType_ElementCategory =
    | "coordinated"
    | ElementCategory

export type ElementPageId =
    | "word"
    | "category"
    | "phrase"
    | "clause"
    | "noun"
    | "pronoun"
    | "verb"
    | "infinitive"
    | "participle"
    | "gerund"
    | "adjective"
    | "adverb"
    | "preposition"
    | "determiner"
    | "coordinator"
    | "subordinator"
    | "interjection"
    | "noun-phrase"
    | "verb-phrase"
    | "adjective-phrase"
    | "adverb-phrase"
    | "preposition-phrase"
    | "gerund-phrase"
    | "infinitive-phrase"
    | "participle-phrase"
    | "independent-clause"
    | "noun-clause"
    | "relative-clause"
    | "adverbial-clause"
    | "sentence"
    | "coordinated"
type PageIdToPageType = Record<ElementPageId, ElementPageType>;
type PageTypeToPageId = Record<ElementPageType, ElementPageId>;

const idToTypeMap: PageIdToPageType = {
    coordinated: "coordinated",
    word: "word",
    category: "partOfSpeech",
    phrase: "phrase",
    clause: "clause",
    noun: "noun",
    pronoun: "pronoun",
    verb: "verb",
    infinitive: "infinitive",
    participle: "participle",
    gerund: "gerund",
    adjective: "adjective",
    adverb: "adverb",
    preposition: "preposition",
    determiner: "determiner",
    coordinator: "coordinator",
    subordinator: "subordinator",
    interjection: "interjection",
    "noun-phrase": "nounPhrase",
    "verb-phrase": "verbPhrase",
    "adjective-phrase": "adjectivePhrase",
    "adverb-phrase": "adverbPhrase",
    "preposition-phrase": "prepositionPhrase",
    "gerund-phrase": "gerundPhrase",
    "infinitive-phrase": "infinitivePhrase",
    "participle-phrase": "participlePhrase",
    "independent-clause": "independentClause",
    "noun-clause": "nounClause",
    "relative-clause": "relativeClause",
    "adverbial-clause": "adverbialClause",
    sentence: "sentence"
};
const typeToIdMap: PageTypeToPageId = Object.fromEntries(
    Object.entries(idToTypeMap).map(([key, value]) => [value, key])
) as PageTypeToPageId;

function isElementPageType(value: string): value is ElementPageType {
    return value in typeToIdMap;
}

function isElementPageId(value: string): value is ElementPageId {
    return value in idToTypeMap;
}

function typeToId(type: ElementPageType): ElementPageId {
    const output = typeToIdMap[type];
    if (output === undefined) {
        throw `Value '${type}' is not a valid ElementPageType`;
    }
    return output;
}

function idToType(id: ElementPageId): ElementPageType {
    const output = idToTypeMap[id];
    if (output === undefined) {
        throw `Value '${id}' is not a valid ElementPageId`;
    }
    return output as ElementPageType;
}

function isElementType(value: string): value is ElementPageType_ElementType {
    return isElementPageType(value) && ElementType.isElementType(value);
}

const elementCategorySet = new Set<ElementPageType_ElementCategory>([
    "word",
    "partOfSpeech",
    "phrase",
    "clause",
    "coordinated"
]);

function isElementCategory(value: string): value is ElementPageType_ElementCategory {
    return elementCategorySet.has(value as any);
}

function createTypeLink(type: ElementPageType, plural?: boolean): HTMLAnchorObject | HTMLCodeObject {
    if (type === "word") {
        console.log("word link created");
        return {
            type: "code",
            className: "typeLink",
            content: "Word"
        };
    }
    const fullName = _getFullName(type, plural);
    return {
        type: "a",
        className: "typeLink",
        href: `/element/${typeToId(type)}`,
        content: {
            type: "code",
            content: fullName
        }
    };
}

function _getFullName(type: ElementPageType, plural?: boolean): string {
    if (isElementType(type)) {
        const { fullName } = ElementDisplayInfo.getDisplayInfo(type);
        return plural
            ? `${fullName}s`
            : fullName;
    } else if (isElementCategory(type)) {
        switch (type) {
            case "word":
            case "phrase":
            case "clause":
            case "sentence":
                return plural
                    ? `${Strings.capitalize(type)}s`
                    : Strings.capitalize(type);
            case "partOfSpeech":
                return plural
                    ? "Categories"
                    : "Category";
            case "coordinated":
                return Strings.capitalize(type);
        }
    }
    throw `Cannot find full name for type '${type}'`;
}

const pageIdOrderArray: ElementPageId[] = [
    "word",
    "category",
    "noun",
    "pronoun",
    "verb",
    "infinitive",
    "participle",
    "gerund",
    "adjective",
    "adverb",
    "preposition",
    "determiner",
    "coordinator",
    "subordinator",
    "phrase",
    "interjection",
    "noun-phrase",
    "verb-phrase",
    "adjective-phrase",
    "adverb-phrase",
    "preposition-phrase",
    "gerund-phrase",
    "infinitive-phrase",
    "participle-phrase",
    "clause",
    "independent-clause",
    "noun-clause",
    "relative-clause",
    "adverbial-clause",
    "sentence",
    "coordinated"
];

function getAllPageIds(): ElementPageId[] {
    return [...pageIdOrderArray];
}

const pageIdOrderObj: Record<ElementPageId, number> = Object.fromEntries(pageIdOrderArray.map((value, index) => [value, index])) as any;

function sortPageIds(a: ElementPageId, b: ElementPageId): number {
    const aIndex = pageIdOrderObj[a];
    const bIndex = pageIdOrderObj[b];
    return aIndex - bIndex;
}

export const ElementPage = {
    getAllPageIds: getAllPageIds,
    typeToId: typeToId,
    idToType: idToType,
    isPageId: isElementPageId,
    isPageType: isElementPageType,
    isElementType: isElementType,
    isElementCategory: isElementCategory,
    createTypeLink: createTypeLink,
    sortPageIds: sortPageIds
};