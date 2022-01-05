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
    "subordinator"
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
    | "subordinator";
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
export type CoordinatedPartOfSpeechType = CoordinatedType<Exclude<PartOfSpeechType, "coordinator" | "subordinator">>;

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
    ...CoordClauseList
];
export type ElementType =
    | "word"
    | PartOfSpeechType
    | CoordinatedPartOfSpeechType
    | PhraseGuard<PhraseType>
    | CoordinatedPhraseType
    | ClauseGuard<ClauseType>
    | CoordClauseType;

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