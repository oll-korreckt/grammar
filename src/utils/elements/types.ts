import { ElementCategory } from "@domain/language";
import { ClauseList, PartOfSpeechList, PhraseList } from "@domain/language/_types/utils";

export type ElementPageType =
    | "coordinated"
    | PartOfSpeechList[number]
    | PhraseList[number]
    | ClauseList[number]
    | ElementCategory;

export type ElementPageId = keyof _ElementPageData;
type Item<Type extends ElementPageType> = Type;
type _ElementPageData = {
    coordinated: Item<"coordinated">;
    word: Item<"word">;
    category: Item<"partOfSpeech">;
    phrase: Item<"phrase">;
    clause: Item<"clause">;
    noun: Item<"noun">;
    verb: Item<"verb">;
    infinitive: Item<"infinitive">;
    participle: Item<"participle">;
    gerund: Item<"gerund">;
    adjective: Item<"adjective">;
    adverb: Item<"adverb">;
    preposition: Item<"preposition">;
    determiner: Item<"determiner">;
    coordinator: Item<"coordinator">;
    subordinator: Item<"subordinator">;
    "noun-phrase": Item<"nounPhrase">;
    "verb-phrase": Item<"verbPhrase">;
    "adjective-phrase": Item<"adjectivePhrase">;
    "adverb-phrase": Item<"adverbPhrase">;
    "preposition-phrase": Item<"prepositionPhrase">;
    "gerund-phrase": Item<"gerundPhrase">;
    "infinitive-phrase": Item<"infinitivePhrase">;
    "participle-phrase": Item<"participlePhrase">;
    "independent-clause": Item<"independentClause">;
    "noun-clause": Item<"nounClause">;
    "relative-clause": Item<"relativeClause">;
    "adverbial-clause": Item<"adverbialClause">;
}

const dataObj: _ElementPageData = {
    coordinated: "coordinated",
    word: "word",
    category: "partOfSpeech",
    phrase: "phrase",
    clause: "clause",
    noun: "noun",
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
    "adverbial-clause": "adverbialClause"
};

function pageTypeToId(type: ElementPageType): string {
    let output = "";
    for (let index = 0; index < type.length; index++) {
        const char = type[index];
        if (char === char.toUpperCase()) {
            output += `-${char.toLowerCase()}`;
        } else {
            output += char;
        }
    }
    return output;
}

function idToPageType(id: string): ElementPageType {
    let output = "";
    let index = 0;
    while (index < id.length) {
        const char = id[index];
        if (char === "-") {
            const nextChar = id[index + 1];
            output += nextChar.toUpperCase();
            index++;
        } else {
            output += char;
        }
        index++;
    }
    return output as ElementPageType;
}

export const ElementPageType = {
    pageTypeToId: pageTypeToId,
    idToPageType: idToPageType
};