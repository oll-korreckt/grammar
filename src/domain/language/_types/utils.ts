export type ElementId = string;
type Element = Record<string, undefined | string | ElementReference | ElementReference[]>;
export interface Identifiable extends Element {
    id: ElementId;
}

type CoordinatedType<Type extends string> = `coordinated${Capitalize<Type>}`;

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
export type CoordinatedPartOfSpeechType = CoordinatedType<Exclude<PartOfSpeechType, "coordinator" | "subordinator">>;

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
export type CoordinatedPhraseType = CoordinatedType<PhraseGuard<PhraseType>>;

export type ClauseType =
    | "independent"
    | "noun"
    | "relative"
    | "adverbial";
export type ClauseGuard<Type extends ClauseType> = `${Type}Clause`;
export type CoordClauseType = CoordinatedType<ClauseGuard<ClauseType>>;

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

//#region Word
export interface Word extends Identifiable {
    lexeme: string;
}
export function isWord(element: Identifiable): element is Word {
    return (element as Word).lexeme !== undefined;
}
export type WordReference = ElementReference<"word">;
//#endregion