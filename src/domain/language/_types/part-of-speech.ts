import { ElementType, PartOfSpeechType, CoordinatedPartOfSpeechType, Identifiable, ReferencingElementDefinition, ReferencingElement } from "./utils";

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
    : Type extends PosGuard<"interjection"> ? Interjection
    : never;
export type PosDefinitionMapper<Type extends PartOfSpeechType> =
    Type extends PosGuard<"noun"> ? NounDefinition
    : Type extends PosGuard<"pronoun"> ? PronounDefinition
    : Type extends PosGuard<"verb"> ? VerbDefinition
    : Type extends PosGuard<"infinitive"> ? InfinitiveDefinition
    : Type extends PosGuard<"participle"> ? ParticipleDefinition
    : Type extends PosGuard<"gerund"> ? GerundDefinition
    : Type extends PosGuard<"adjective"> ? AdjectiveDefinition
    : Type extends PosGuard<"adverb"> ? AdverbDefinition
    : Type extends PosGuard<"preposition"> ? PrepositionDefinition
    : Type extends PosGuard<"determiner"> ? DeterminerDefinition
    : Type extends PosGuard<"coordinator"> ? CoordinatorDefinition
    : Type extends PosGuard<"subordinator"> ? SubordinatorDefinition
    : Type extends PosGuard<"interjection"> ? InterjectionDefinition
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
export type CoordPosDefinitionMapper<Type extends CoordinatedPartOfSpeechType> =
    Type extends CoordPosGuard<"coordinatedNoun"> ? CoordinatedDefinition<["noun"]>
    : Type extends CoordPosGuard<"coordinatedPronoun"> ? CoordinatedDefinition<["pronoun"]>
    : Type extends CoordPosGuard<"coordinatedVerb"> ? CoordinatedDefinition<["verb"]>
    : Type extends CoordPosGuard<"coordinatedInfinitive"> ? CoordinatedDefinition<["infinitive"]>
    : Type extends CoordPosGuard<"coordinatedParticiple"> ? CoordinatedDefinition<["participle"]>
    : Type extends CoordPosGuard<"coordinatedGerund"> ? CoordinatedDefinition<["gerund"]>
    : Type extends CoordPosGuard<"coordinatedAdjective"> ? CoordinatedDefinition<["adjective"]>
    : Type extends CoordPosGuard<"coordinatedAdverb"> ? CoordinatedDefinition<["adverb"]>
    : Type extends CoordPosGuard<"coordinatedPreposition"> ? CoordinatedDefinition<["preposition"]>
    : Type extends CoordPosGuard<"coordinatedDeterminer"> ? CoordinatedDefinition<["determiner"]>
    : never;

export interface CoordinatedDefinition<T extends ElementType[]> extends Record<"items" | "coordinator", [boolean, ElementType[]]> {
    items: [true, T];
    coordinator: [false, ["coordinator"]];
}
export interface Coordinated<T extends ElementType[]> extends Identifiable, ReferencingElement<CoordinatedDefinition<T>> {
    itemType: string;
}

export interface CoordinatedPartOfSpeech<TPartOfSpeechType extends PartOfSpeechType>
    extends Coordinated<[TPartOfSpeechType]>, PartOfSpeech {
    itemType: TPartOfSpeechType;
    posType: TPartOfSpeechType;
}

export type FunctionalTypeGuard<T extends ElementType[]> = T;
export type PosFunctionalTypeGuard<T extends Exclude<PartOfSpeechType, "coordinator" | "subordinator" | "interjection">> = FunctionalTypeGuard<[T, `coordinated${Capitalize<T>}`]>

export interface PartOfSpeech extends Identifiable {
    posType?: PartOfSpeechType;
}

export interface NounDefinition extends ReferencingElementDefinition<"words"> {
    // Single: table
    // Multi: water bottle
    words: [true, ["word"]];
}
export interface Noun extends PartOfSpeech, ReferencingElement<NounDefinition> {
    posType: "noun";
}
// Coordinated: carnivores, herbivores, and omnivores
export type FunctionalNoun = PosFunctionalTypeGuard<"noun">;

export interface PronounDefinition extends ReferencingElementDefinition<"words"> {
    // Single: he
    // Multi: each other
    words: [true, ["word"]];
}
export interface Pronoun extends PartOfSpeech, ReferencingElement<PronounDefinition> {
    posType: "pronoun";
}
// Coordinated: he and she
export type FunctionalPronoun = PosFunctionalTypeGuard<"pronoun">;

export interface VerbDefinition extends ReferencingElementDefinition<"mainVerb" | "auxiliaryVerbs"> {
    // Single: add
    // Multi: add up
    mainVerb: [true, ["word"]];
    // Single: will
    // Multi: will have
    auxiliaryVerbs: [true, ["word"]];
}
export interface Verb extends PartOfSpeech, ReferencingElement<VerbDefinition> {
    posType: "verb";
}
// Coordinated: am running and (am) skipping
export type FunctionalVerb = PosFunctionalTypeGuard<"verb">;

export interface AdjectiveDefinition extends ReferencingElementDefinition<"words"> {
    // Single: unhappy
    // Multi: New Yorker
    words: [true, ["word"]];
}
export interface Adjective extends PartOfSpeech, ReferencingElement<AdjectiveDefinition> {
    posType: "adjective";
}
// Coordinated: energetic yet focused
export type FunctionalAdjective = PosFunctionalTypeGuard<"adjective">;

export interface AdverbDefinition extends ReferencingElementDefinition<"word"> {
    word: [false, ["word"]];
}
export interface Adverb extends PartOfSpeech, ReferencingElement<AdverbDefinition> {
    posType: "adverb";
}
// Coordinated: slowly but surely
export type FunctionalAdverb = PosFunctionalTypeGuard<"adverb">;

export interface PrepositionDefinition extends ReferencingElementDefinition<"words"> {
    // Single: for
    // Multi: because of
    words: [true, ["word"]];
}
export interface Preposition extends PartOfSpeech, ReferencingElement<PrepositionDefinition> {
    posType: "preposition";
}
// Coordinated: in or near
export type FunctionalPreposition = PosFunctionalTypeGuard<"preposition">;

export interface DeterminerDefinition extends ReferencingElementDefinition<"words"> {
    // Single: this
    // Multi: half of the
    words: [true, ["word"]];
}
export interface Determiner extends PartOfSpeech, ReferencingElement<DeterminerDefinition> {
    posType: "determiner";
}
// Coordinated: each and every
export type FunctionalDeterminer = PosFunctionalTypeGuard<"determiner">;

export interface CoordinatorDefinition extends ReferencingElementDefinition<"words"> {
    // Single: and
    // Multi: neither <...> nor <...>
    words: [true, ["word"]];
}
export interface Coordinator extends PartOfSpeech, ReferencingElement<CoordinatorDefinition> {
    posType: "coordinator";
}

export interface SubordinatorDefinition extends ReferencingElementDefinition<"words"> {
    // Single: because
    // Multi: even though
    words: [true, ["word"]];
}
export interface Subordinator extends PartOfSpeech, ReferencingElement<SubordinatorDefinition> {
    posType: "subordinator";
}

export interface InfinitiveDefinition extends ReferencingElementDefinition<"to" | "verb"> {
    to: [false, ["word"]];
    verb: [true, ["word"]];
}
export interface Infinitive extends PartOfSpeech, ReferencingElement<InfinitiveDefinition> {
    posType: "infinitive";
}
// Coordinated: to eat and (to) drink
export type FunctionalInfinitive = PosFunctionalTypeGuard<"infinitive">;

export interface GerundDefinition extends ReferencingElementDefinition<"word"> {
    word: [true, ["word"]];
}
export interface Gerund extends PartOfSpeech, ReferencingElement<GerundDefinition> {
    posType: "gerund";
}
// Coordinated: smoking and drinking
export type FunctionalGerund = PosFunctionalTypeGuard<"gerund">;

export interface ParticipleDefinition extends ReferencingElementDefinition<"word"> {
    word: [true, ["word"]];
}
export interface Participle extends PartOfSpeech, ReferencingElement<ParticipleDefinition> {
    posType: "participle";
}
// Coordinated: broken and shattered
export type FunctionalParticiple = PosFunctionalTypeGuard<"participle">;
export interface InterjectionDefinition extends ReferencingElementDefinition<"words"> {
    words: [true, ["word"]];
}
export interface Interjection extends PartOfSpeech, ReferencingElement<InterjectionDefinition> {
    posType: "interjection";
}