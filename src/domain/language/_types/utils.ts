export type ElementId = string;
export type ElementRecord = Record<string, undefined | string | ElementReference | ElementReference[]>;
export interface Identifiable {
    id: ElementId;
}

type CoordinatedType<Type extends string> = `coordinated${Capitalize<Type>}`;

export type PartOfSpeechList = [
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
    "interjection"
];
export type PartOfSpeechType =
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
    | "interjection";
export type CoordinatedPartOfSpeechList = [
    CoordinatedType<"noun">,
    CoordinatedType<"pronoun">,
    CoordinatedType<"verb">,
    CoordinatedType<"infinitive">,
    CoordinatedType<"participle">,
    CoordinatedType<"gerund">,
    CoordinatedType<"adjective">,
    CoordinatedType<"adverb">,
    CoordinatedType<"preposition">,
    CoordinatedType<"determiner">
];
export type CoordinatedPartOfSpeechType = CoordinatedType<Exclude<PartOfSpeechType, "coordinator" | "subordinator" | "interjection">>;

export type PhraseList = [
    PhraseGuard<"noun">,
    PhraseGuard<"verb">,
    PhraseGuard<"adjective">,
    PhraseGuard<"adverb">,
    PhraseGuard<"preposition">,
    PhraseGuard<"gerund">,
    PhraseGuard<"infinitive">,
    PhraseGuard<"participle">
];
export type PhraseType =
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "preposition"
    | "gerund"
    | "infinitive"
    | "participle";
export type PhraseGuard<Type extends PhraseType> = `${Type}Phrase`;
export type CoordinatedPhraseList = [
    CoordinatedType<PhraseGuard<"noun">>,
    CoordinatedType<PhraseGuard<"verb">>,
    CoordinatedType<PhraseGuard<"adjective">>,
    CoordinatedType<PhraseGuard<"adverb">>,
    CoordinatedType<PhraseGuard<"preposition">>,
    CoordinatedType<PhraseGuard<"gerund">>,
    CoordinatedType<PhraseGuard<"infinitive">>,
    CoordinatedType<PhraseGuard<"participle">>
];
export type CoordinatedPhraseType = CoordinatedType<PhraseGuard<PhraseType>>;

export type ClauseList = [
    ClauseGuard<"independent">,
    ClauseGuard<"noun">,
    ClauseGuard<"relative">,
    ClauseGuard<"adverbial">
];
export type ClauseType =
    | "independent"
    | "noun"
    | "relative"
    | "adverbial";
export type ClauseGuard<Type extends ClauseType> = `${Type}Clause`;
export type CoordClauseList = [
    CoordinatedType<ClauseGuard<"independent">>,
    CoordinatedType<ClauseGuard<"noun">>,
    CoordinatedType<ClauseGuard<"relative">>,
    CoordinatedType<ClauseGuard<"adverbial">>
];
export type CoordClauseType = CoordinatedType<ClauseGuard<ClauseType>>;

export type ElementTypeList = [
    "word",
    ...PartOfSpeechList,
    ...CoordinatedPartOfSpeechList,
    ...PhraseList,
    ...CoordinatedPhraseList,
    ...ClauseList,
    ...CoordClauseList,
    "sentence"
];
export type ElementType =
    | "word"
    | PartOfSpeechType
    | CoordinatedPartOfSpeechType
    | PhraseGuard<PhraseType>
    | CoordinatedPhraseType
    | ClauseGuard<ClauseType>
    | CoordClauseType
    | "sentence";

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
    "subordinator",
    "interjection"
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
    ...coordClauseList,
    "sentence"
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

export const elementSet = new Set<string>(elementTypeList);

function isElementType(value: string): value is ElementType {
    return elementSet.has(value);
}

export const ElementType = {
    isElementType: isElementType
};

export interface ElementReference<TElementType extends ElementType = ElementType> {
    id: ElementId;
    type: TElementType;
}

export type ReferencingElementDefinition<Keys extends string> = Record<Keys, [boolean, ElementType[]]>;
export type ReferencingElement<Type> = {
    [Key in keyof Type]?: DefinitionMapper<Type[Key]>;
}
export type DefinitionMapper<Type> = undefined | (Type extends [boolean, ElementType[]] ? (Type[0] extends true ? ElementReference<Type[1][number]>[] : ElementReference<Type[1][number]>) : never);

export interface Word extends Identifiable {
    lexeme: string;
}
type SentenceItemsList = [
    "noun",
    "pronoun",
    "coordinatedNoun",
    "coordinatedPronoun",
    "nounPhrase",
    "coordinatedNounPhrase",
    "interjection",
    "independentClause",
    "coordinatedIndependentClause"
];
export interface SentenceDefinition extends ReferencingElementDefinition<"items"> {
    items: [true, SentenceItemsList];
}
export interface Sentence extends Identifiable, ReferencingElement<SentenceDefinition> {
    elementType: "sentence";
}