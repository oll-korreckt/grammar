import { ElementType, PartOfSpeechType, CoordinatedPartOfSpeechType, Identifiable, WordReference, ElementReference } from "./utils";

type PosGuard<Type extends PartOfSpeechType> = Type;
type CoordPosGuard<Type extends CoordinatedPartOfSpeechType> = Type;
export type PosMapper<Type extends ElementType> =
    Type extends PosGuard<"noun"> ? Noun
    : Type extends PosGuard<"pronoun"> ? Pronoun
    : Type extends PosGuard<"verb"> ? Verb
    : Type extends PosGuard<"infinitive"> ? Infinitive
    : Type extends PosGuard<"participle"> ? Participle
    : Type extends PosGuard<"gerund"> ? Gerund
    : Type extends PosGuard<"adjective"> ? Adjective
    : Type extends PosGuard<"adverb"> ? Adverb
    : Type extends PosGuard<"preposition"> ? Preposition
    : Type extends PosGuard<"determiner"> ? Determiner
    : Type extends PosGuard<"coordinator"> ? Coordinator
    : Type extends PosGuard<"subordinator"> ? Subordinator
    : never;

export type CoordPosMapper<Type extends CoordinatedPartOfSpeechType> =
    Type extends CoordPosGuard<"coordinatedNoun"> ? CoordinatedPartOfSpeech<"noun">
    : Type extends CoordPosGuard<"coordinatedPronoun"> ? CoordinatedPartOfSpeech<"pronoun">
    : Type extends CoordPosGuard<"coordinatedVerb"> ? CoordinatedPartOfSpeech<"verb">
    : Type extends CoordPosGuard<"coordinatedInfinitive"> ? CoordinatedPartOfSpeech<"infinitive">
    : Type extends CoordPosGuard<"coordinatedParticiple"> ? CoordinatedPartOfSpeech<"participle">
    : Type extends CoordPosGuard<"coordinatedGerund"> ? CoordinatedPartOfSpeech<"gerund">
    : Type extends CoordPosGuard<"coordinatedAdjective"> ? CoordinatedPartOfSpeech<"adjective">
    : Type extends CoordPosGuard<"coordinatedAdverb"> ? CoordinatedPartOfSpeech<"adverb">
    : Type extends CoordPosGuard<"coordinatedPreposition"> ? CoordinatedPartOfSpeech<"preposition">
    : Type extends CoordPosGuard<"coordinatedDeterminer"> ? CoordinatedPartOfSpeech<"determiner">
    : never;

export interface Coordinated<T extends ElementType> extends Identifiable {
    itemType: string;
    items?: ElementReference<T>[];
    coordinator?: ElementReference<"coordinator">;
}

export interface CoordinatedPartOfSpeech<TPartOfSpeechType extends PartOfSpeechType>
    extends Coordinated<TPartOfSpeechType>, PartOfSpeech {
    itemType: TPartOfSpeechType;
    posType: TPartOfSpeechType;
}

function makeCoordinatedPartOfSpeechTypeGuard<TPartOfSpeechType extends PartOfSpeechType>(
    partOfSpeechType: TPartOfSpeechType): (element: Identifiable) => element is CoordinatedPartOfSpeech<TPartOfSpeechType> {
    return function (element: Identifiable): element is CoordinatedPartOfSpeech<TPartOfSpeechType> {
        const typed = element as CoordinatedPartOfSpeech<TPartOfSpeechType>;
        return typed.posType === partOfSpeechType
            && typed.itemType === partOfSpeechType;
    };
}

export type SingleOrCoordinatedPartOfSpeech<TPartOfSpeechType extends PartOfSpeechType> =
    | PosMapper<TPartOfSpeechType>
    | CoordinatedPartOfSpeech<TPartOfSpeechType>;

export interface PartOfSpeech extends Identifiable {
    posType?: PartOfSpeechType;
}

function makePartOfSpeechTypeGuard<Type extends PartOfSpeechType>(
    partOfSpeechType: Type): (element: Identifiable) => element is PosMapper<Type> {
    return function (element: Identifiable): element is PosMapper<Type> {
        return (element as PartOfSpeech).posType !== partOfSpeechType;
    };
}

// Single: table
// Multi: water bottle
export interface Noun extends PartOfSpeech {
    posType: "noun";
    words?: WordReference[];
}
// Coordinated: carnivores, herbivores, and omnivores
export type FunctionalNoun = SingleOrCoordinatedPartOfSpeech<"noun">;
export const isNoun = makePartOfSpeechTypeGuard("noun");
export const isCoordinatedNoun = makeCoordinatedPartOfSpeechTypeGuard("noun");

// Single: he
// Multi: each other
export interface Pronoun extends PartOfSpeech {
    posType: "pronoun";
    words?: WordReference[];
}
// Coordinated: he and she
export type FunctionalPronoun = SingleOrCoordinatedPartOfSpeech<"pronoun">;
export const isPronoun = makePartOfSpeechTypeGuard("pronoun");
export const isCoordinatedPronoun = makeCoordinatedPartOfSpeechTypeGuard("pronoun");

export interface Verb extends PartOfSpeech {
    posType: "verb";
    // Single: add
    // Multi: add up
    mainVerb?: WordReference[];
    // Single: will
    // Multi: will have
    auxiliaryVerbs?: WordReference[];
}
// Coordinated: am running and (am) skipping
export type FunctionalVerb = SingleOrCoordinatedPartOfSpeech<"verb">;
export const isVerb = makePartOfSpeechTypeGuard("verb");
export const isCoordinatedVerb = makeCoordinatedPartOfSpeechTypeGuard("verb");

// Single: unhappy
// Multi: New Yorker
export interface Adjective extends PartOfSpeech {
    posType: "adjective";
    words?: WordReference[];
}
// Coordinated: energetic yet focused
export type FunctionalAdjective = SingleOrCoordinatedPartOfSpeech<"adjective">;
export const isAdjective = makePartOfSpeechTypeGuard("adjective");
export const isCoordinatedAdjective = makeCoordinatedPartOfSpeechTypeGuard("adjective");

export interface Adverb extends PartOfSpeech {
    posType: "adverb";
    word?: WordReference;
}
// Coordinated: slowly but surely
export type FunctionalAdverb = SingleOrCoordinatedPartOfSpeech<"adverb">;
export const isAdverb = makePartOfSpeechTypeGuard("adverb");
export const isCoordinatedAdverb = makeCoordinatedPartOfSpeechTypeGuard("adverb");

// Single: for
// Multi: because of
export interface Preposition extends PartOfSpeech {
    posType: "preposition";
    words?: WordReference[];
}
// Coordinated: in or near
export type FunctionalPreposition = SingleOrCoordinatedPartOfSpeech<"preposition">;
export const isPreposition = makePartOfSpeechTypeGuard("preposition");
export const isCoordinatedPreposition = makeCoordinatedPartOfSpeechTypeGuard("preposition");

// Single: this
// Multi: half of the
export interface Determiner extends PartOfSpeech {
    posType: "determiner";
    words?: WordReference[];
}
// Coordinated: each and every
export type FunctionalDeterminer = SingleOrCoordinatedPartOfSpeech<"determiner">;
export const isDeterminer = makePartOfSpeechTypeGuard("determiner");
export const isCoordinatedDeterminer = makeCoordinatedPartOfSpeechTypeGuard("determiner");

// Single: and
// Multi: neither <...> nor <...>
export interface Coordinator extends PartOfSpeech {
    posType: "coordinator";
    words?: WordReference[];
}

// Single: because
// Multi: even though
export interface Subordinator extends PartOfSpeech {
    posType: "subordinator";
    words?: WordReference[];
}

export interface Infinitive extends PartOfSpeech {
    posType: "infinitive";
    to?: WordReference;
    verb?: WordReference[];
}
// Coordinated: to eat and (to) drink
export type FunctionalInfinitive = SingleOrCoordinatedPartOfSpeech<"infinitive">;
export const isInfinitive = makePartOfSpeechTypeGuard("infinitive");
export const isCoordinatedInfinitive = makeCoordinatedPartOfSpeechTypeGuard("infinitive");

export interface Gerund extends PartOfSpeech {
    posType: "gerund";
    word?: WordReference[];
}
// Coordinated: smoking and drinking
export type FunctionalGerund = SingleOrCoordinatedPartOfSpeech<"gerund">;
export const isGerund = makePartOfSpeechTypeGuard("gerund");
export const isCoordinatedGerund = makeCoordinatedPartOfSpeechTypeGuard("gerund");

export interface Participle extends PartOfSpeech {
    posType: "participle";
    word?: WordReference[];
}
// Coordinated: broken and shattered
export type FunctionalParticiple = SingleOrCoordinatedPartOfSpeech<"participle">;
export const isParticiple = makePartOfSpeechTypeGuard("participle");
export const isCoordinatedParticiple = makeCoordinatedPartOfSpeechTypeGuard("participle");