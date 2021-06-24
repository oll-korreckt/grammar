import { Identifiable, PartOfSpeechType, ElementReference, PhraseType, CoordinatedPhraseType, PhraseGuard } from "./utils";
import { Coordinated, FunctionalNoun, FunctionalPronoun, SingleOrCoordinatedPartOfSpeech } from "./part-of-speech";

type CoordPhraseGuard<Type extends CoordinatedPhraseType> = Type;
export type PhraseMapper<Type extends PhraseGuard<PhraseType>> =
    Type extends PhraseGuard<"noun"> ? NounPhrase
    : Type extends PhraseGuard<"verb"> ? VerbPhrase
    : Type extends PhraseGuard<"adjective"> ? AdjectivePhrase
    : Type extends PhraseGuard<"adverb"> ? AdverbPhrase
    : Type extends PhraseGuard<"preposition"> ? PrepositionPhrase
    : Type extends PhraseGuard<"gerund"> ? GerundPhrase
    : Type extends PhraseGuard<"infinitive"> ? InfinitivePhrase
    : Type extends PhraseGuard<"participle"> ? ParticiplePhrase
    : never;

export type CoordPhraseMapper<Type extends CoordinatedPhraseType> =
    Type extends CoordPhraseGuard<"coordinatedNounPhrase"> ? CoordinatedNounPhrase
    : Type extends CoordPhraseGuard<"coordinatedVerbPhrase"> ? CoordinatedPhrase<"verb">
    : Type extends CoordPhraseGuard<"coordinatedAdjectivePhrase"> ? CoordinatedPhrase<"adjective">
    : Type extends CoordPhraseGuard<"coordinatedAdverbPhrase"> ? CoordinatedPhrase<"adverb">
    : Type extends CoordPhraseGuard<"coordinatedPrepositionPhrase"> ? CoordinatedPhrase<"preposition">
    : Type extends CoordPhraseGuard<"coordinatedGerundPhrase"> ? CoordinatedPhrase<"gerund">
    : Type extends CoordPhraseGuard<"coordinatedInfinitivePhrase"> ? CoordinatedPhrase<"infinitive">
    : Type extends CoordPhraseGuard<"coordinatedParticiplePhrase"> ? CoordinatedPhrase<"participle">
    : never;

export interface Phrase extends Identifiable {
    phraseType?: PhraseType;
}

function makePhraseTypeGuard<TPhraseType extends PhraseType>(phraseType: TPhraseType): (element: Identifiable) => element is PhraseMapper<PhraseGuard<TPhraseType>> {
    return function (element: Identifiable): element is PhraseMapper<PhraseGuard<TPhraseType>> {
        return (element as Phrase).phraseType === phraseType;
    };
}

export interface CoordinatedPhrase<TPhraseType extends PhraseType & PartOfSpeechType>
    extends Coordinated<TPhraseType | PhraseGuard<TPhraseType>>, Phrase {
    itemType: `${TPhraseType} | ${PhraseGuard<TPhraseType>}`;
    phraseType: TPhraseType;
}

function makeCoordinatedPhraseTypeGuard<TPhraseType extends PhraseType & PartOfSpeechType>(
    phraseType: TPhraseType): (element: Identifiable) => element is CoordinatedPhrase<TPhraseType> {
    return function (element: Identifiable): element is CoordinatedPhrase<TPhraseType> {
        const typed = element as CoordinatedPhrase<TPhraseType>;
        return typed.phraseType === phraseType && typed.itemType === `${phraseType} | ${phraseType}Phrase`;
    };
}

type SingleOrCoordinatedPhrase<TPhraseType extends PhraseType & PartOfSpeechType> =
    | SingleOrCoordinatedPartOfSpeech<TPhraseType>
    | PhraseMapper<PhraseGuard<TPhraseType>>
    | CoordinatedPhrase<TPhraseType>;

export interface CoordinatedNounPhrase extends Phrase, Coordinated<"noun" | "pronoun" | "nounPhrase"> {
    itemType: "noun | pronoun | nounPhrase";
    phraseType: "noun";
}
export function isCoordinatedNounPhrase(element: Identifiable): element is CoordinatedNounPhrase {
    const typed = element as CoordinatedNounPhrase;
    return typed.phraseType === "noun"
        && typed.itemType === "noun | pronoun | nounPhrase";
}

export const NounPhraseHeadTypes = [
    "noun",
    "pronoun",
    "coordinatedNounPhrase"
] as const;
export type NounPhraseHead = ElementReference<typeof NounPhraseHeadTypes[number]>;
export const NounModiferTypes = [
    // the team
    "coordinatedDeterminer",
    // the good team
    "coordinatedAdjectivePhrase",
    // the only team in the state
    "coordinatedPrepositionPhrase",
    // the only team who has a chance
    "coordinatedRelativeClause",
    // the defeated team
    "coordinatedParticiplePhrase",
    // the team to beat
    "coordinatedInfinitivePhrase"
] as const;
export type NounModifier = ElementReference<typeof NounModiferTypes[number]>;
export interface NounPhrase extends Phrase {
    phraseType: "noun";
    head?: NounPhraseHead;
    modifiers?: NounModifier[];
}
// Coordinated: the ugly horse and the lazy bear
export type FunctionalNounPhrase = FunctionalNoun | FunctionalPronoun | NounPhrase | CoordinatedNounPhrase;
export const isNounPhrase = makePhraseTypeGuard("noun");

export const SubjectComplementTypes = [
    "coordinatedNounPhrase",
    "coordinatedNounClause",
    "coordinatedAdjectivePhrase",
    "coordinatedPrepositionPhrase"
] as const;
export type SubjectComplement = ElementReference<typeof SubjectComplementTypes[number]>;

export const VerbObjectTypes = [
    "coordinatedNounPhrase",
    "coordinatedNounClause",
    "coordinatedGerundPhrase",
    "coordinatedInfinitivePhrase"
] as const;
export type VerbObject = ElementReference<typeof VerbObjectTypes[number]>;

export const VerbModifierTypes = [
    "coordinatedAdverb",
    "coordinatedAdverbPhrase",
    "coordinatedAdverbialClause",
    "coordinatedNounPhrase",
    "coordinatedNoun",
    "coordinatedPrepositionPhrase",
    "coordinatedInfinitivePhrase"
] as const;
export type VerbModifier = ElementReference<typeof VerbModifierTypes[number]>;
export const VerbComplementTypes = VerbModifierTypes;
export type VerbComplement = VerbModifier;
export const VerbDirectObjectComplementTypes = [
    "coordinatedNounPhrase",
    "coordinatedAdjectivePhrase",
    "coordinatedInfinitivePhrase",
    "coordinatedParticiplePhrase",
    "coordinatedNounClause",
    "coordinatedRelativeClause",
    "coordinatedAdverbialClause"
] as const;
export type VerbDirectObjectComplement = ElementReference<typeof VerbDirectObjectComplementTypes[number]>;
export interface VerbPhrase extends Phrase {
    phraseType: "verb";
    head?: ElementReference<"coordinatedVerb">;
    /*
        Not semantically essential. Can come before or after the verb.
        Ex1: told the story QUICKLY
        Ex2: QUICKLY told the story
    */
    headModifier?: VerbModifier;
    /*
        Semantically essential. Always located after the verb. Appears
        immediately after the verb if verb is intransitive. Appears after the
        direct object if the verb is transitive.
        Ex1: We are staying IN THE HOTEL.
        Ex2: She gave the book BACK TO ME.
    */
    headCompl?: VerbComplement;
    /*
        Can only be used with linking verbs. Describes the subject.
        Ex: He is A GOOD DOCTOR.
    */
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    /*
        Can only be used with factitive verbs. Comes after the direct object and
        renames or re-identifies the object of the verb.
        Ex: They made him COMMISSIONER OF THE POLICE DEPARTMENT.
    */
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: am running and (am) skipping
export type FunctionalVerbPhrase = SingleOrCoordinatedPhrase<"verb">;
export const isVerbPhrase = makePhraseTypeGuard("verb");
export const isCoordinatedVerbPhrase = makeCoordinatedPhraseTypeGuard("verb");

export const AdjectiveComplementTypes = [
    "coordinatedPrepositionPhrase",
    "coordinatedInfinitivePhrase",
    "coordinatedNounPhrase"
] as const;
export type AdjectiveComplement = ElementReference<typeof AdjectiveComplementTypes[number]>;
export interface AdjectivePhrase extends Phrase {
    phraseType: "adjective";
    determiner?: ElementReference<"coordinatedDeterminer">;
    head?: ElementReference<"coordinatedAdjective">;
    modifiers?: ElementReference<"coordinatedAdverbPhrase">[];
    complement?: AdjectiveComplement;
}
// Coordinated: very fast and extremely energetic
export type FunctionalAdjectivePhrase = SingleOrCoordinatedPhrase<"adjective">;
export const isAdjectivePhrase = makePhraseTypeGuard("adjective");
export const isCoordinatedAdjectivePhrase = makeCoordinatedPhraseTypeGuard("adjective");

export interface AdverbPhrase extends Phrase {
    phraseType: "adverb";
    head?: ElementReference<"adverb">;
    modifier?: ElementReference<"adverb">;
}
// Coordinated: somewhat slowly yet quite efficiently
export type FunctionalAdverbPhrase = SingleOrCoordinatedPhrase<"adverb">;
export const isAdverbPhrase = makePhraseTypeGuard("adverb");
export const isCoordinatedAdverbPhrase = makeCoordinatedPhraseTypeGuard("adverb");

export const PrepositionObjectTypes = VerbObjectTypes;
export type PrepositionObject = ElementReference<typeof PrepositionObjectTypes[number]>;
export interface PrepositionPhrase extends Phrase {
    phraseType: "preposition";
    head?: ElementReference<"coordinatedPreposition">;
    object?: PrepositionObject;
}
// Coordinated: both on my own and with others
export type FunctionalPrepositionPhrase = SingleOrCoordinatedPhrase<"preposition">;
export const isPrepositionPhrase = makePhraseTypeGuard("preposition");
export const isCoordinatedPrepositionPhrase = makeCoordinatedPhraseTypeGuard("preposition");

// same composition as VerbPhrase
export interface GerundPhrase extends Phrase {
    phraseType: "gerund";
    head?: ElementReference<"coordinatedGerund">;
    headModifier?: VerbModifier;
    headCompl?: VerbComplement;
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: smoking cigarettes and drinking beer
export type FunctionalGerundPhrase = SingleOrCoordinatedPhrase<"gerund">;
export const isGerundPhrase = makePhraseTypeGuard("gerund");
export const isCoordinatedGerundPhrase = makeCoordinatedPhraseTypeGuard("gerund");

// same composition as VerbPhrase
export interface InfinitivePhrase extends Phrase {
    phraseType: "infinitive";
    head?: ElementReference<"coordinatedInfinitive">;
    headModifier?: VerbModifier;
    headCompl?: VerbComplement;
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: to swim laps and (to) run marathons
export type FunctionalInfinitivePhrase = SingleOrCoordinatedPhrase<"infinitive">;
export const isInfinitivePhrase = makePhraseTypeGuard("infinitive");
export const isCoordinatedInfinitivePhrase = makeCoordinatedPhraseTypeGuard("infinitive");

// same composition as VerbPhrase
export interface ParticiplePhrase extends Phrase {
    phraseType: "participle";
    head?: ElementReference<"coordinatedParticiple">;
    headModifier?: VerbModifier;
    headCompl?: VerbComplement;
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: clenching his fists yet not saying anything
export type FunctionalParticiplePhrase = SingleOrCoordinatedPhrase<"participle">;
export const isParticiplePhrase = makePhraseTypeGuard("participle");
export const isCoordinatedParticiplePhrase = makeCoordinatedPhraseTypeGuard("participle");