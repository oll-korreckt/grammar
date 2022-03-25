import { Identifiable, PartOfSpeechType, PhraseType, CoordinatedPhraseType, PhraseGuard, ReferencingElementDefinition, ReferencingElement } from "./utils";
import { Coordinated, CoordinatedDefinition, FunctionalAdjective, FunctionalDeterminer, FunctionalGerund, FunctionalInfinitive, FunctionalNoun, FunctionalParticiple, FunctionalPreposition, FunctionalPronoun, FunctionalTypeGuard, FunctionalVerb, PosFunctionalTypeGuard } from "./part-of-speech";
import { FunctionalAdverbialClause, FunctionalNounClause, FunctionalRelativeClause } from "./clause";

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
export type PhraseDefinitionMapper<Type extends PhraseGuard<PhraseType>> =
    Type extends PhraseGuard<"noun"> ? NounPhraseDefinition
    : Type extends PhraseGuard<"verb"> ? VerbPhraseDefinition
    : Type extends PhraseGuard<"adjective"> ? AdjectivePhraseDefinition
    : Type extends PhraseGuard<"adverb"> ? AdverbPhraseDefinition
    : Type extends PhraseGuard<"preposition"> ? PrepositionPhraseDefinition
    : Type extends PhraseGuard<"gerund"> ? GerundPhraseDefinition
    : Type extends PhraseGuard<"infinitive"> ? InfinitivePhraseDefinition
    : Type extends PhraseGuard<"participle"> ? ParticiplePhraseDefinition
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
export type CoordPhraseDefinitionMapper<Type extends CoordinatedPhraseType> =
    Type extends CoordPhraseGuard<"coordinatedNounPhrase"> ? CoordinatedDefinition<["noun", "pronoun", "nounPhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedVerbPhrase"> ? CoordinatedDefinition<["verb", "verbPhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedAdjectivePhrase"> ? CoordinatedDefinition<["adjective", "adjectivePhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedAdverbPhrase"> ? CoordinatedDefinition<["adverb", "adverbPhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedPrepositionPhrase"> ? CoordinatedDefinition<["preposition", "prepositionPhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedGerundPhrase"> ? CoordinatedDefinition<["gerund", "gerundPhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedInfinitivePhrase"> ? CoordinatedDefinition<["infinitive", "infinitivePhrase"]>
    : Type extends CoordPhraseGuard<"coordinatedParticiplePhrase"> ? CoordinatedDefinition<["participle", "participlePhrase"]>
    : never;

export interface Phrase extends Identifiable {
    phraseType?: PhraseType;
}

export interface CoordinatedPhrase<TPhraseType extends PhraseType & PartOfSpeechType>
    extends Coordinated<[TPhraseType, PhraseGuard<TPhraseType>]>, Phrase {
    itemType: `${TPhraseType} | ${PhraseGuard<TPhraseType>}`;
    phraseType: TPhraseType;
}

type PhraseFunctionalTypeGuard<T extends PhraseType & PartOfSpeechType> = FunctionalTypeGuard<[
    ...PosFunctionalTypeGuard<T>,
    PhraseGuard<T>,
    `coordinated${Capitalize<PhraseGuard<T>>}`
]>;

export interface CoordinatedNounPhrase extends Phrase, Coordinated<["noun", "pronoun", "nounPhrase"]> {
    itemType: "noun | pronoun | nounPhrase";
    phraseType: "noun";
}

export interface NounPhraseDefinition extends ReferencingElementDefinition<"head" | "modifiers"> {
    head: [
        false,
        [
            "noun",
            "pronoun",
            "coordinatedNounPhrase"
        ]
    ];
    modifiers: [
        true,
        [
            // the team
            ...FunctionalDeterminer,
            // the good team
            ...FunctionalAdjectivePhrase,
            // the only team in the state
            ...FunctionalPrepositionPhrase,
            // the only team who has a chance
            ...FunctionalRelativeClause,
            // the defeated team
            ...FunctionalParticiplePhrase,
            // the team to beat
            ...FunctionalInfinitivePhrase
        ]
    ];
}
export interface NounPhrase extends Phrase, ReferencingElement<NounPhraseDefinition> {
    phraseType: "noun";
}
// Coordinated: the ugly horse and the lazy bear
export type FunctionalNounPhrase = FunctionalTypeGuard<[...FunctionalNoun, ...FunctionalPronoun, "nounPhrase", "coordinatedNounPhrase"]>;

type HeadModifer = [
    ...FunctionalAdverbPhrase,
    ...FunctionalAdverbialClause,
    ...FunctionalNounPhrase,
    ...FunctionalPrepositionPhrase,
    ...FunctionalInfinitivePhrase
];
type HeadComplement = HeadModifer;
type SubjectComplement = [
    ...FunctionalNounPhrase,
    ...FunctionalNounClause,
    ...FunctionalAdjectivePhrase,
    ...FunctionalPrepositionPhrase
];
type ObjectBase = [
    ...FunctionalNounPhrase,
    ...FunctionalNounClause,
    ...FunctionalGerundPhrase
];
type VerbObject = [
    ...ObjectBase,
    ...FunctionalInfinitivePhrase
];
type VerbDirectObjectComplement = [
    ...FunctionalNounPhrase,
    ...FunctionalAdjectivePhrase,
    ...FunctionalInfinitivePhrase,
    ...FunctionalParticiplePhrase,
    ...FunctionalNounClause,
    ...FunctionalRelativeClause,
    ...FunctionalAdverbialClause
];
export interface VerbPhraseBaseDefinition extends ReferencingElementDefinition<"head" | "headModifier" | "headCompl" | "subjCompl" | "dirObj" | "dirObjCompl" | "indObj"> {
    /*
        Not semantically essential. Can come before or after the verb.
        Ex1: told the story QUICKLY
        Ex2: QUICKLY told the story
    */
    headModifier: [false, HeadModifer];
    /*
        Semantically essential. Always located after the verb. Appears
        immediately after the verb if verb is intransitive. Appears after the
        direct object if the verb is transitive.
        Ex1: We are staying IN THE HOTEL.
        Ex2: She gave the book BACK TO ME.
    */
    headCompl: [false, HeadComplement];
    /*
        Can only be used with linking verbs. Describes the subject.
        Ex: He is A GOOD DOCTOR.
    */
    subjCompl: [false, SubjectComplement];
    dirObj: [false, VerbObject];
    /*
        Can only be used with factitive verbs. Comes after the direct object and
        renames or re-identifies the object of the verb.
        Ex: They made him COMMISSIONER OF THE POLICE DEPARTMENT.
    */
    dirObjCompl: [false, VerbDirectObjectComplement];
    indObj: [false, ObjectBase];
}
export interface VerbPhraseDefinition extends VerbPhraseBaseDefinition {
    head: [false, FunctionalVerb];
}
export interface VerbPhrase extends Phrase, ReferencingElement<VerbPhraseDefinition> {
    phraseType: "verb";
}
// Coordinated: am running and (am) skipping
export type FunctionalVerbPhrase = PhraseFunctionalTypeGuard<"verb">;

type AdjectiveComplement = [
    ...FunctionalPrepositionPhrase,
    ...FunctionalInfinitivePhrase,
    ...FunctionalNounPhrase
];
export interface AdjectivePhraseDefinition extends ReferencingElementDefinition<"determiner" | "head" | "modifiers" | "complement"> {
    determiner: [false, FunctionalDeterminer];
    head: [false, FunctionalAdjective];
    modifiers: [true, FunctionalAdverbPhrase];
    complement: [false, AdjectiveComplement];
}
export interface AdjectivePhrase extends Phrase, ReferencingElement<AdjectivePhraseDefinition> {
    phraseType: "adjective";
}
// Coordinated: very fast and extremely energetic
export type FunctionalAdjectivePhrase = PhraseFunctionalTypeGuard<"adjective">;

export interface AdverbPhraseDefinition extends ReferencingElementDefinition<"head" | "modifier"> {
    head: [false, ["adverb"]];
    modifier: [false, ["adverb"]];
}
export interface AdverbPhrase extends Phrase, ReferencingElement<AdverbPhraseDefinition> {
    phraseType: "adverb";
}
// Coordinated: somewhat slowly yet quite efficiently
export type FunctionalAdverbPhrase = PhraseFunctionalTypeGuard<"adverb">;

type PrepositionObject = VerbObject;
export interface PrepositionPhraseDefinition extends ReferencingElementDefinition<"head" | "object"> {
    head: [false, FunctionalPreposition];
    object: [false, PrepositionObject];
}
export interface PrepositionPhrase extends Phrase, ReferencingElement<PrepositionPhraseDefinition> {
    phraseType: "preposition";
}
// Coordinated: both on my own and with others
export type FunctionalPrepositionPhrase = [
    PhraseGuard<"preposition">,
    CoordPhraseGuard<"coordinatedPrepositionPhrase">
];

// same composition as VerbPhrase
export interface GerundPhraseDefinition extends VerbPhraseBaseDefinition {
    head: [false, FunctionalGerund];
}
export interface GerundPhrase extends Phrase, ReferencingElement<GerundPhraseDefinition> {
    phraseType: "gerund";
}
// Coordinated: smoking cigarettes and drinking beer
export type FunctionalGerundPhrase = PhraseFunctionalTypeGuard<"gerund">;

// same composition as VerbPhrase
export interface InfinitivePhraseDefinition extends VerbPhraseBaseDefinition {
    head: [false, FunctionalInfinitive];
}
export interface InfinitivePhrase extends Phrase, ReferencingElement<InfinitivePhraseDefinition> {
    phraseType: "infinitive";
}
// Coordinated: to swim laps and (to) run marathons
export type FunctionalInfinitivePhrase = PhraseFunctionalTypeGuard<"infinitive">;

// same composition as VerbPhrase
export interface ParticiplePhraseDefinition extends VerbPhraseBaseDefinition {
    head: [false, FunctionalParticiple];
}
export interface ParticiplePhrase extends Phrase, ReferencingElement<ParticiplePhraseDefinition> {
    phraseType: "participle";
}
// Coordinated: clenching his fists yet not saying anything
export type FunctionalParticiplePhrase = PhraseFunctionalTypeGuard<"participle">;