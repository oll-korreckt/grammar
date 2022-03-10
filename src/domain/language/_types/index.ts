import { PartOfSpeechType, CoordinatedPartOfSpeechType, PhraseGuard, PhraseType, CoordinatedPhraseType, ClauseGuard, ClauseType, CoordClauseType, ElementType, Word, PartOfSpeechList, CoordinatedPartOfSpeechList, PhraseList, CoordinatedPhraseList, ClauseList, CoordClauseList, ElementTypeList } from "./utils";
import { PosMapper, CoordPosMapper, PosDefinitionMapper, CoordPosDefinitionMapper, CoordinatedDefinition } from "./part-of-speech";
import { PhraseMapper, CoordPhraseMapper, PhraseDefinitionMapper, CoordPhraseDefinitionMapper, VerbPhraseBaseDefinition, FunctionalAdverbPhrase, FunctionalNounPhrase, FunctionalPrepositionPhrase, FunctionalInfinitivePhrase, FunctionalAdjectivePhrase, FunctionalGerundPhrase, FunctionalParticiplePhrase, FunctionalVerbPhrase } from "./phrase";
import { ClauseMapper, ClauseDefinitionMapper, CoordClauseMapper, CoordClauseDefinitionMapper, DependentClauseDefinition } from "./clause";
import { SimpleObject, Strings } from "@lib/utils";

export type {
    ElementRecord,
    ElementId,
    Identifiable,
    PartOfSpeechType,
    PhraseType,
    PhraseGuard,
    ClauseType,
    ClauseGuard,
    ElementType,
    ElementReference,
    Word
} from "./utils";
export type {
    PartOfSpeech,
    CoordinatedPartOfSpeech,
    Coordinated,
    Noun,
    Pronoun,
    Verb,
    Adjective,
    Adverb,
    Preposition,
    Infinitive,
    Participle,
    Gerund,
    Determiner,
    Coordinator,
    Subordinator
} from "./part-of-speech";
export type {
    Phrase,
    CoordinatedPhrase,
    NounPhrase,
    CoordinatedNounPhrase,
    VerbPhrase,
    AdjectivePhrase,
    AdverbPhrase,
    PrepositionPhrase,
    GerundPhrase,
    InfinitivePhrase,
    ParticiplePhrase
} from "./phrase";
export type {
    Clause,
    CoordinatedClause,
    IndependentClause,
    NounClause,
    RelativeClause,
    AdverbialClause
} from "./clause";

export type TokenType = "whitespace" | "word" | "end";
export interface Token {
    lexeme: string;
    tokenType: TokenType;
}
type ElementGuard<Type extends ElementType> = Type;
export type ElementMapper<Type extends ElementType> =
    Type extends ElementGuard<"word"> ? Word
    : Type extends PartOfSpeechType ? PosMapper<Type>
    : Type extends CoordinatedPartOfSpeechType ? CoordPosMapper<Type>
    : Type extends PhraseGuard<PhraseType> ? PhraseMapper<Type>
    : Type extends CoordinatedPhraseType ? CoordPhraseMapper<Type>
    : Type extends ClauseGuard<ClauseType> ? ClauseMapper<Type>
    : Type extends CoordClauseType ? CoordClauseMapper<Type>
    : never;
export type Element = ElementMapper<ElementType>;

export type ElementDefinitionMapper<Type extends Exclude<ElementType, "word">> =
    Type extends PartOfSpeechType ? PosDefinitionMapper<Type>
    : Type extends CoordinatedPartOfSpeechType ? CoordPosDefinitionMapper<Type>
    : Type extends PhraseGuard<PhraseType> ? PhraseDefinitionMapper<Type>
    : Type extends CoordinatedPhraseType ? CoordPhraseDefinitionMapper<Type>
    : Type extends ClauseGuard<ClauseType> ? ClauseDefinitionMapper<Type>
    : Type extends CoordClauseType ? CoordClauseDefinitionMapper<Type>
    : never;

type DefinitionObject = {
    [Key in Exclude<ElementType, "word">]: ElementDefinitionMapper<Key>;
}

function createCoordinatedDefinition<T extends ElementType[]>(itemTypes: T): CoordinatedDefinition<T> {
    return {
        coordinator: [false, ["coordinator"]],
        items: [true, itemTypes]
    };
}

const fnAdverbPhrase: FunctionalAdverbPhrase = [
    "adverb",
    "coordinatedAdverb",
    "adverbPhrase",
    "coordinatedAdverbPhrase"
];
const fnNounPhrase: FunctionalNounPhrase = [
    "noun",
    "coordinatedNoun",
    "pronoun",
    "coordinatedPronoun",
    "nounPhrase",
    "coordinatedNounPhrase"
];
const fnPrepositionPhrase: FunctionalPrepositionPhrase = [
    "preposition",
    "coordinatedPreposition",
    "prepositionPhrase",
    "coordinatedPrepositionPhrase"
];
const fnInfinitivePhrase: FunctionalInfinitivePhrase = [
    "infinitive",
    "coordinatedInfinitive",
    "infinitivePhrase",
    "coordinatedInfinitivePhrase"
];
const fnAdjectivePhrase: FunctionalAdjectivePhrase = [
    "adjective",
    "coordinatedAdjective",
    "adjectivePhrase",
    "coordinatedAdjectivePhrase"
];
const fnGerundPhrase: FunctionalGerundPhrase = [
    "gerund",
    "coordinatedGerund",
    "gerundPhrase",
    "coordinatedGerundPhrase"
];
const fnParticiplePhrase: FunctionalParticiplePhrase = [
    "participle",
    "coordinatedParticiple",
    "participlePhrase",
    "coordinatedParticiplePhrase"
];
const fnVerbPhrase: FunctionalVerbPhrase = [
    "verb",
    "coordinatedVerb",
    "verbPhrase",
    "coordinatedVerbPhrase"
];

function createVerbPhraseBaseDefinition<T extends ElementType[]>(head: T): Omit<VerbPhraseBaseDefinition, "head"> & { head: [false, T]; } {
    return {
        head: [false, head],
        headModifier: [
            false,
            [
                ...fnAdverbPhrase,
                "adverbialClause",
                "coordinatedAdverbialClause",
                ...fnNounPhrase,
                ...fnPrepositionPhrase,
                ...fnInfinitivePhrase
            ]
        ],
        headCompl: [
            false,
            [
                ...fnAdverbPhrase,
                "adverbialClause",
                "coordinatedAdverbialClause",
                ...fnNounPhrase,
                ...fnPrepositionPhrase,
                ...fnInfinitivePhrase
            ]
        ],
        subjCompl: [
            false,
            [
                ...fnNounPhrase,
                "nounClause",
                "coordinatedNounClause",
                ...fnAdjectivePhrase,
                ...fnPrepositionPhrase
            ]
        ],
        dirObj: [
            false,
            [
                ...fnNounPhrase,
                "nounClause",
                "coordinatedNounClause",
                ...fnGerundPhrase,
                ...fnInfinitivePhrase
            ]
        ],
        dirObjCompl: [
            false,
            [
                ...fnNounPhrase,
                ...fnAdjectivePhrase,
                ...fnInfinitivePhrase,
                ...fnParticiplePhrase,
                "nounClause",
                "coordinatedNounClause",
                "relativeClause",
                "coordinatedRelativeClause",
                "adverbialClause",
                "coordinatedAdverbialClause"
            ]
        ],
        indObj: [
            false,
            [
                ...fnNounPhrase,
                "nounClause",
                "coordinatedNounClause",
                ...fnGerundPhrase,
                ...fnInfinitivePhrase
            ]
        ]
    };
}

function createDependentClauseDefinition<T extends ElementType[]>(dependentWordTypes: T): Omit<DependentClauseDefinition, "dependentWord"> & { dependentWord: [false, T]; } {
    return {
        dependentWord: [false, dependentWordTypes],
        subject: [
            false,
            [
                ...fnNounPhrase,
                "nounClause",
                "coordinatedNounClause",
                ...fnGerundPhrase,
                ...fnInfinitivePhrase
            ]
        ],
        predicate: [false, fnVerbPhrase]
    };
}

const definitionObject: DefinitionObject = {
    noun: {
        words: [true, ["word"]]
    },
    coordinatedNoun: createCoordinatedDefinition(["noun"]),
    nounPhrase: {
        head: [
            false,
            [
                "noun",
                "pronoun",
                "coordinatedNounPhrase"
            ]
        ],
        modifiers: [
            true,
            [
                "determiner",
                "coordinatedDeterminer",
                ...fnAdjectivePhrase,
                ...fnPrepositionPhrase,
                "relativeClause",
                "coordinatedRelativeClause",
                ...fnParticiplePhrase,
                ...fnInfinitivePhrase
            ]
        ]
    },
    coordinatedNounPhrase: createCoordinatedDefinition(["noun", "pronoun", "nounPhrase"]),
    nounClause: createDependentClauseDefinition(["subordinator", "pronoun"]),
    coordinatedNounClause: createCoordinatedDefinition(["nounClause"]),
    pronoun: {
        words: [true, ["word"]]
    },
    coordinatedPronoun: createCoordinatedDefinition(["pronoun"]),
    adjective: {
        words: [true, ["word"]]
    },
    coordinatedAdjective: createCoordinatedDefinition(["adjective"]),
    adjectivePhrase: {
        determiner: [false, ["determiner", "coordinatedDeterminer"]],
        head: [false, ["adjective", "coordinatedAdjective"]],
        modifiers: [true, fnAdverbPhrase],
        complement: [
            false,
            [
                ...fnPrepositionPhrase,
                ...fnInfinitivePhrase,
                ...fnNounPhrase
            ]
        ]
    },
    coordinatedAdjectivePhrase: createCoordinatedDefinition(["adjective", "adjectivePhrase"]),
    verb: {
        auxiliaryVerbs: [true, ["word"]],
        mainVerb: [true, ["word"]]
    },
    coordinatedVerb: createCoordinatedDefinition(["verb"]),
    verbPhrase: createVerbPhraseBaseDefinition(["verb", "coordinatedVerb"]),
    coordinatedVerbPhrase: createCoordinatedDefinition(["verb", "verbPhrase"]),
    adverb: {
        word: [false, ["word"]]
    },
    coordinatedAdverb: createCoordinatedDefinition(["adverb"]),
    adverbPhrase: {
        head: [false, ["adverb"]],
        modifier: [false, ["adverb"]]
    },
    coordinatedAdverbPhrase: createCoordinatedDefinition(["adverb", "adverbPhrase"]),
    adverbialClause: createDependentClauseDefinition(["subordinator"]),
    coordinatedAdverbialClause: createCoordinatedDefinition(["adverbialClause"]),
    infinitive: {
        to: [false, ["word"]],
        verb: [true, ["word"]]
    },
    coordinatedInfinitive: createCoordinatedDefinition(["infinitive"]),
    infinitivePhrase: createVerbPhraseBaseDefinition(["infinitive", "coordinatedInfinitive"]),
    coordinatedInfinitivePhrase: createCoordinatedDefinition(["infinitive", "infinitivePhrase"]),
    gerund: {
        word: [true, ["word"]]
    },
    coordinatedGerund: createCoordinatedDefinition(["gerund"]),
    gerundPhrase: createVerbPhraseBaseDefinition(["gerund", "coordinatedGerund"]),
    coordinatedGerundPhrase: createCoordinatedDefinition(["gerund", "gerundPhrase"]),
    participle: {
        word: [true, ["word"]]
    },
    coordinatedParticiple: createCoordinatedDefinition(["participle"]),
    participlePhrase: createVerbPhraseBaseDefinition(["participle", "coordinatedParticiple"]),
    coordinatedParticiplePhrase: createCoordinatedDefinition(["participle", "participlePhrase"]),
    preposition: {
        words: [true, ["word"]]
    },
    coordinatedPreposition: createCoordinatedDefinition(["preposition"]),
    prepositionPhrase: {
        head: [false, ["preposition", "coordinatedPreposition"]],
        object: [
            false,
            [
                ...fnNounPhrase,
                "nounClause",
                "coordinatedNounClause",
                ...fnGerundPhrase,
                ...fnInfinitivePhrase
            ]
        ]
    },
    coordinatedPrepositionPhrase: createCoordinatedDefinition(["preposition", "prepositionPhrase"]),
    determiner: {
        words: [true, ["word"]]
    },
    coordinatedDeterminer: createCoordinatedDefinition(["determiner"]),
    coordinator: {
        words: [true, ["word"]]
    },
    subordinator: {
        words: [true, ["word"]]
    },
    independentClause: {
        subject: [
            false,
            [
                ...fnNounPhrase,
                "nounClause",
                "coordinatedNounClause",
                ...fnGerundPhrase,
                ...fnInfinitivePhrase
            ]
        ],
        predicate: [false, fnVerbPhrase]
    },
    coordinatedIndependentClause: createCoordinatedDefinition(["independentClause"]),
    relativeClause: createDependentClauseDefinition(["adverb", "pronoun"]),
    coordinatedRelativeClause: createCoordinatedDefinition(["relativeClause"])
};

export function getTypedElementDefinition<T extends Exclude<ElementType, "word">>(type: T): ElementDefinitionMapper<T> {
    return SimpleObject.clone(definitionObject[type]) as ElementDefinitionMapper<T>;
}

export function getElementDefinition(type: Exclude<ElementType, "word">): { [key: string]: [boolean, ElementType[]]; } {
    return getTypedElementDefinition(type) as any;
}

const posList: PartOfSpeechList = [
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
    "subordinator"
];
const coordPosList: CoordinatedPartOfSpeechList = [
    "coordinatedNoun",
    "coordinatedPronoun",
    "coordinatedVerb",
    "coordinatedInfinitive",
    "coordinatedParticiple",
    "coordinatedGerund",
    "coordinatedAdjective",
    "coordinatedAdverb",
    "coordinatedPreposition",
    "coordinatedDeterminer"
];
const phraseList: PhraseList = [
    "nounPhrase",
    "verbPhrase",
    "adjectivePhrase",
    "adverbPhrase",
    "prepositionPhrase",
    "gerundPhrase",
    "infinitivePhrase",
    "participlePhrase"
];
const coordPhraseList: CoordinatedPhraseList = [
    "coordinatedNounPhrase",
    "coordinatedVerbPhrase",
    "coordinatedAdjectivePhrase",
    "coordinatedAdverbPhrase",
    "coordinatedPrepositionPhrase",
    "coordinatedGerundPhrase",
    "coordinatedInfinitivePhrase",
    "coordinatedParticiplePhrase"
];
const clauseList: ClauseList = [
    "independentClause",
    "nounClause",
    "relativeClause",
    "adverbialClause"
];
const coordClauseList: CoordClauseList = [
    "coordinatedIndependentClause",
    "coordinatedNounClause",
    "coordinatedRelativeClause",
    "coordinatedAdverbialClause"
];
const elementTypeList: ElementTypeList = [
    "word",
    ...posList,
    ...coordPosList,
    ...phraseList,
    ...coordPhraseList,
    ...clauseList,
    ...coordClauseList
];

export const elementTypeLists = {
    partOfSpeech: posList,
    coordPartOfSpeech: coordPosList,
    phrase: phraseList,
    coordPhrase: coordPhraseList,
    clause: clauseList,
    coordClause: coordClauseList,
    element: elementTypeList
};

const posSet = new Set([
    ...posList,
    ...coordPosList
]) as Set<string>;
const phraseSet = new Set([
    ...phraseList,
    ...coordPhraseList
]) as Set<string>;
const clauseSet = new Set([
    ...clauseList,
    ...coordClauseList
]) as Set<string>;
const elementSet = new Set<string>(elementTypeList);
export type ElementCategory = "word" | "partOfSpeech" | "phrase" | "clause";

function _wordFilter(category: ElementCategory): boolean {
    return category === "word";
}

function _partOfSpeechFilter(category: ElementCategory): boolean {
    switch (category) {
        case "word":
        case "partOfSpeech":
            return true;
        default:
            return false;
    }
}

function _phraseFilter(category: ElementCategory): boolean {
    return category !== "clause";
}

function _clauseFilter(): boolean {
    return true;
}

function getLayerFilter(category: ElementCategory): (category: ElementCategory) => boolean {
    switch (category) {
        case "word":
            return _wordFilter;
        case "partOfSpeech":
            return _partOfSpeechFilter;
        case "phrase":
            return _phraseFilter;
        case "clause":
            return _clauseFilter;
        default:
            throw `unsupported category ${category}`;
    }
}
function getElementCategory(type: ElementType): ElementCategory {
    if (type === "word") {
        return "word";
    } else if (posSet.has(type)) {
        return "partOfSpeech";
    } else if (phraseSet.has(type)) {
        return "phrase";
    } else if (clauseSet.has(type)) {
        return "clause";
    }
    throw `Unhandled type '${type}'`;
}

function isCoordinated(type: ElementType): boolean {
    return type.startsWith("coordinated");
}

function isCoordinable(type: ElementType): boolean {
    if (isCoordinated(type)) {
        return true;
    }
    const coordType = `coordinated${Strings.capitalize(type)}`;
    return elementSet.has(coordType);
}

export const ElementCategory = {
    isCoordinated: isCoordinated,
    isCoordinable: isCoordinable,
    getLayerFilter: getLayerFilter,
    getElementCategory: getElementCategory,
    getDefault(category?: ElementCategory): ElementCategory {
        return category !== undefined ? category : "clause";
    }
};