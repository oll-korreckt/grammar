export type TokenType = "whitespace" | "word" | "end";

export interface Token {
    lexeme: string;
    tokenType: TokenType;
}

//#region PartOfSpeech
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

export type ElementId = string;

type CoordinatedType<BaseType extends string, Category extends string = ""> = `coordinated${Capitalize<BaseType>}${Category}`;
type BasePartOfSpeechType = Exclude<PartOfSpeechType, "coordinator">;
type CoordinatedPartOfSpeechType = CoordinatedType<Exclude<PartOfSpeechType, "coordinator" | "subordinator">>;
type BasePhraseType = PhraseType;
type CoordinatedPhraseType = CoordinatedType<PhraseType, "Phrase">;
type BaseClauseType = ClauseType;
type CoordinatedClauseType = CoordinatedType<ClauseType, "Clause">;
export type ElementType =
    | "word"
    | BasePartOfSpeechType
    | CoordinatedPartOfSpeechType
    | BasePhraseType
    | CoordinatedPhraseType
    | BaseClauseType
    | CoordinatedClauseType;

export interface ElementReference<TElementType extends ElementType = ElementType> {
    id: ElementId;
    type: TElementType;
}

export interface Identifiable {
    id: ElementId;
}

export interface Word extends Identifiable {
    lexeme: string;
}
export type WordReference = ElementReference<"word">;
export function isWord(element: Identifiable): element is Word {
    return (element as Word).lexeme !== undefined;
}

export interface Coordinated<T> extends Identifiable {
    itemType: string;
    items?: T[];
    coordinator?: Coordinator;
}

export interface PartOfSpeech extends Identifiable {
    posType?: PartOfSpeechType;
}

function makePartOfSpeechTypeGuard<TPartOfSpeech extends PartOfSpeech>(
    partOfSpeechType: PartOfSpeechType): (element: Identifiable) => element is TPartOfSpeech {
    return function (element: Identifiable): element is TPartOfSpeech {
        return (element as TPartOfSpeech).posType !== partOfSpeechType;
    };
}

export interface CoordinatedPartOfSpeech<
    TPartOfSpeech extends PartOfSpeech,
    TPartOfSpeechType extends PartOfSpeechType>
    extends Coordinated<TPartOfSpeech>, PartOfSpeech {
    posType: TPartOfSpeechType;
}

function makeCoordinatedPartOfSpeechTypeGuard<TPartOfSpeech extends PartOfSpeech, TPartOfSpeechType extends PartOfSpeechType>(
    partOfSpeechType: TPartOfSpeechType): (element: Identifiable) => element is CoordinatedPartOfSpeech<TPartOfSpeech, TPartOfSpeechType> {
    return function (element: Identifiable): element is CoordinatedPartOfSpeech<TPartOfSpeech, TPartOfSpeechType> {
        const typed = element as CoordinatedPartOfSpeech<TPartOfSpeech, TPartOfSpeechType>;
        return typed.posType === partOfSpeechType
            && typed.itemType === partOfSpeechType;
    };
}

type SingleOrCoordinatedPartOfSpeech<
    TPartOfSpeech extends PartOfSpeech,
    TPartOfSpeechType extends PartOfSpeechType> =
    | TPartOfSpeech
    | CoordinatedPartOfSpeech<TPartOfSpeech, TPartOfSpeechType>;

// Single: table
// Multi: water bottle
export interface Noun extends PartOfSpeech {
    posType: "noun";
    words?: WordReference[];
}
// Coordinated: carnivores, herbivores, and omnivores
export type FunctionalNoun = SingleOrCoordinatedPartOfSpeech<Noun, "noun">;
export const isNoun = makePartOfSpeechTypeGuard<Noun>("noun");
export const isCoordinatedNoun = makeCoordinatedPartOfSpeechTypeGuard<Noun, "noun">("noun");

// Single: he
// Multi: each other
export interface Pronoun extends PartOfSpeech {
    posType: "pronoun";
    words?: WordReference[];
}
// Coordinated: he and she
export type FunctionalPronoun = SingleOrCoordinatedPartOfSpeech<Pronoun, "pronoun">;
export const isPronoun = makePartOfSpeechTypeGuard<Pronoun>("pronoun");
export const isCoordinatedPronoun = makeCoordinatedPartOfSpeechTypeGuard<Pronoun, "pronoun">("pronoun");

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
export type FunctionalVerb = SingleOrCoordinatedPartOfSpeech<Verb, "verb">;
export const isVerb = makePartOfSpeechTypeGuard<Verb>("verb");
export const isCoordinatedVerb = makeCoordinatedPartOfSpeechTypeGuard<Verb, "verb">("verb");

// Single: unhappy
// Multi: New Yorker
export interface Adjective extends PartOfSpeech {
    posType: "adjective";
    words?: WordReference[];
}
// Coordinated: energetic yet focused
export type FunctionalAdjective = SingleOrCoordinatedPartOfSpeech<Adjective, "adjective">;
export const isAdjective = makePartOfSpeechTypeGuard<Adjective>("adjective");
export const isCoordinatedAdjective = makeCoordinatedPartOfSpeechTypeGuard<Adjective, "adjective">("adjective");

export interface Adverb extends PartOfSpeech {
    posType: "adverb";
    word?: WordReference;
}
// Coordinated: slowly but surely
export type FunctionalAdverb = SingleOrCoordinatedPartOfSpeech<Adverb, "adverb">;
export const isAdverb = makePartOfSpeechTypeGuard<Adverb>("adverb");
export const isCoordinatedAdverb = makeCoordinatedPartOfSpeechTypeGuard<Adverb, "adverb">("adverb");

// Single: for
// Multi: because of
export interface Preposition extends PartOfSpeech {
    posType: "preposition";
    words?: WordReference[];
}
// Coordinated: in or near
export type FunctionalPreposition = SingleOrCoordinatedPartOfSpeech<Preposition, "preposition">;
export const isPreposition = makePartOfSpeechTypeGuard<Preposition>("preposition");
export const isCoordinatedPreposition = makeCoordinatedPartOfSpeechTypeGuard<Preposition, "preposition">("preposition");

// Single: this
// Multi: half of the
export interface Determiner extends PartOfSpeech {
    posType: "determiner";
    words?: WordReference[];
}
// Coordinated: each and every
export type FunctionalDeterminer = SingleOrCoordinatedPartOfSpeech<Determiner, "determiner">;
export const isDeterminer = makePartOfSpeechTypeGuard<Determiner>("determiner");
export const isCoordinatedDeterminer = makeCoordinatedPartOfSpeechTypeGuard<Determiner, "determiner">("determiner");

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
export type FunctionalInfinitive = SingleOrCoordinatedPartOfSpeech<Infinitive, "infinitive">;
export const isInfinitive = makePartOfSpeechTypeGuard<Infinitive>("infinitive");
export const isCoordinatedInfinitive = makeCoordinatedPartOfSpeechTypeGuard<Infinitive, "infinitive">("infinitive");

export interface Gerund extends PartOfSpeech {
    posType: "gerund";
    word?: WordReference[];
}
// Coordinated: smoking and drinking
export type FunctionalGerund = SingleOrCoordinatedPartOfSpeech<Gerund, "gerund">;
export const isGerund = makePartOfSpeechTypeGuard<Gerund>("gerund");
export const isCoordinatedGerund = makeCoordinatedPartOfSpeechTypeGuard<Gerund, "gerund">("gerund");

export interface Participle extends PartOfSpeech {
    posType: "participle";
    word?: WordReference[];
}
// Coordinated: broken and shattered
export type FunctionalParticiple = SingleOrCoordinatedPartOfSpeech<Participle, "participle">;
export const isParticiple = makePartOfSpeechTypeGuard<Participle>("participle");
export const isCoordinatedParticiple = makeCoordinatedPartOfSpeechTypeGuard<Participle, "participle">("participle");
//#endregion

//#region Phrase
export type PhraseType =
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "preposition"
    | "gerund"
    | "infinitive"
    | "participle"

export interface Phrase extends Identifiable {
    phraseType?: PhraseType;
}

function makePhraseTypeGuard<TPhrase extends Phrase>(phraseType: PhraseType): (element: Identifiable) => element is TPhrase {
    return function (element: Identifiable): element is TPhrase {
        return (element as Phrase).phraseType === phraseType;
    };
}

export interface CoordinatedPhrase<
    TPartOfSpeech extends PartOfSpeech,
    TPhrase extends Phrase,
    TPhraseType extends PhraseType & PartOfSpeechType>
    extends Coordinated<TPartOfSpeech | TPhrase>, Phrase {
    itemType: `${TPhraseType} | ${TPhraseType}Phrase`;
    phraseType: TPhraseType;
}

function makeCoordinatedPhraseTypeGuard<TPartOfSpeech extends PartOfSpeech, TPhrase extends Phrase, TPhraseType extends PhraseType & PartOfSpeechType>(
    phraseType: TPhraseType): (element: Identifiable) => element is CoordinatedPhrase<TPartOfSpeech, TPhrase, TPhraseType> {
    return function (element: Identifiable): element is CoordinatedPhrase<TPartOfSpeech, TPhrase, TPhraseType> {
        const typed = element as CoordinatedPhrase<TPartOfSpeech, TPhrase, TPhraseType>;
        return typed.phraseType === phraseType && typed.itemType === `${phraseType} | ${phraseType}Phrase`;
    };
}

type SingleOrCoordinatedPhrase<
    TPartOfSpeech extends PartOfSpeech,
    TPartOfSpeechType extends PartOfSpeechType,
    TPhrase extends Phrase,
    TPhraseType extends PhraseType> =
    | SingleOrCoordinatedPartOfSpeech<TPartOfSpeech, TPartOfSpeechType>
    | TPhrase
    | CoordinatedPhrase<TPartOfSpeech, TPhrase, TPhraseType>;

export interface CoordinatedNounPhrase extends Phrase, Coordinated<Noun | Pronoun | NounPhrase> {
    itemType: "noun | pronoun | nounPhrase";
    phraseType: "noun";
}
export function isCoordinatedNounPhrase(element: Identifiable): element is CoordinatedNounPhrase {
    const typed = element as CoordinatedNounPhrase;
    return typed.phraseType === "noun"
        && typed.itemType === "noun | pronoun | nounPhrase";
}

export type NounPhraseHead =
    | Noun
    | Pronoun
    | CoordinatedNounPhrase;
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
export const isNounPhrase = makePhraseTypeGuard<NounPhrase>("noun");

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
export type FunctionalVerbPhrase = SingleOrCoordinatedPhrase<Verb, "verb", VerbPhrase, "verb">;
export const isVerbPhrase = makePhraseTypeGuard<Verb>("verb");
export const isCoordinatedVerbPhrase = makeCoordinatedPhraseTypeGuard<Verb, VerbPhrase, "verb">("verb");

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
export type FunctionalAdjectivePhrase = SingleOrCoordinatedPhrase<Adjective, "adjective", AdjectivePhrase, "adjective">;
export const isAdjectivePhrase = makePhraseTypeGuard<AdjectivePhrase>("adjective");
export const isCoordinatedAdjectivePhrase = makeCoordinatedPhraseTypeGuard<Adjective, AdjectivePhrase, "adjective">("adjective");

export interface AdverbPhrase extends Phrase {
    phraseType: "adverb";
    head?: ElementReference<"adverb">;
    modifier?: ElementReference<"adverb">;
}
// Coordinated: somewhat slowly yet quite efficiently
export type FunctionalAdverbPhrase = SingleOrCoordinatedPhrase<Adverb, "adverb", AdverbPhrase, "adverb">;
export const isAdverbPhrase = makePhraseTypeGuard<AdverbPhrase>("adverb");
export const isCoordinatedAdverbPhrase = makeCoordinatedPhraseTypeGuard<Adverb, AdverbPhrase, "adverb">("adverb");

export type PrepositionObject = VerbObject;
export const PrepositionObjectTypes = VerbObjectTypes;
export interface PrepositionPhrase extends Phrase {
    phraseType: "preposition";
    head?: ElementReference<"coordinatedPreposition">;
    object?: PrepositionObject;
}
// Coordinated: both on my own and with others
export type FunctionalPrepositionPhrase = SingleOrCoordinatedPhrase<Preposition, "preposition", PrepositionPhrase, "preposition">;
export const isPrepositionPhrase = makePhraseTypeGuard<PrepositionPhrase>("preposition");
export const isCoordinatedPrepositionPhrase = makeCoordinatedPhraseTypeGuard<Preposition, PrepositionPhrase, "preposition">("preposition");

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
export type FunctionalGerundPhrase = SingleOrCoordinatedPhrase<Gerund, "gerund", GerundPhrase, "gerund">;
export const isGerundPhrase = makePhraseTypeGuard<GerundPhrase>("gerund");
export const isCoordinatedGerundPhrase = makeCoordinatedPhraseTypeGuard<Gerund, GerundPhrase, "gerund">("gerund");

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
export type FunctionalInfinitivePhrase = SingleOrCoordinatedPhrase<Infinitive, "infinitive", InfinitivePhrase, "infinitive">;
export const isInfinitivePhrase = makePhraseTypeGuard<InfinitivePhrase>("infinitive");
export const isCoordinatedInfinitivePhrase = makeCoordinatedPhraseTypeGuard<Infinitive, InfinitivePhrase, "infinitive">("infinitive");

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
export type FunctionalParticiplePhrase = SingleOrCoordinatedPhrase<Participle, "participle", ParticiplePhrase, "participle">;
export const isParticiplePhrase = makePhraseTypeGuard<ParticiplePhrase>("participle");
export const isCoordinatedParticiplePhrase = makeCoordinatedPhraseTypeGuard<Participle, ParticiplePhrase, "participle">("participle");
//#endregion

//#region Clause
export type ClauseType =
    | "independent"
    | "noun"
    | "relative"
    | "adverbial";

export interface Clause extends Identifiable {
    clauseType?: ClauseType;
}

function makeClauseTypeGuard<TClause extends Clause>(clauseType: ClauseType): (element: Identifiable) => element is TClause {
    return function (element: Identifiable): element is TClause {
        return (element as TClause).clauseType === clauseType;
    };
}

export interface CoordinatedClause<
    TClause extends Clause,
    TClauseType extends ClauseType>
    extends Coordinated<TClause>, Clause {
    itemType: TClauseType;
    clauseType: TClauseType;
}

function makeCoordinatedClauseTypeGuard<TClause extends Clause, TClauseType extends ClauseType>(
    clauseType: TClauseType): (element: Identifiable) => element is CoordinatedClause<TClause, TClauseType> {
    return function (element: Identifiable): element is CoordinatedClause<TClause, TClauseType> {
        const typed = element as CoordinatedClause<TClause, TClauseType>;
        return typed.clauseType === clauseType && typed.itemType === clauseType;
    };
}

type SingleOrCoordinatedClause<
    TClause extends Clause,
    TClauseType extends ClauseType> =
    | TClause
    | CoordinatedClause<TClause, TClauseType>;

export const SubjectTypes = [
    "coordinatedNoun",
    "coordinatedNounPhrase",
    "coordinatedNounClause",
    "coordinatedGerundPhrase",
    "coordinatedInfinitivePhrase"
] as const;
export type Subject = ElementReference<typeof SubjectTypes[number]>;

export type Predicate = ElementReference<"coordinatedVerbPhrase">;
export interface IndependentClause extends Clause {
    clauseType: "independent";
    subject?: Subject;
    predicate?: Predicate;
}
export type FunctionalIndependentClause = SingleOrCoordinatedClause<IndependentClause, "independent">;
export const isIndependentClause = makeClauseTypeGuard<IndependentClause>("independent");
export const isCoordinatedIndependentClause = makeCoordinatedClauseTypeGuard<IndependentClause, "independent">("independent");

export const NounClauseDependentWordType = [
    "subordinator",
    "pronoun"
] as const;
export type NounClauseDependentWord = ElementReference<typeof NounClauseDependentWordType[number]>;
// sometimes the dependent word also acts as a subject or object of the clause
export interface NounClause extends Clause {
    clauseType: "noun";
    dependentWord?: NounClauseDependentWord;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: wherever we decide to go and whatever we decide to do
export type FunctionalNounClause = SingleOrCoordinatedClause<NounClause, "noun">;
export const isNounClause = makeClauseTypeGuard<NounClause>("noun");
export const isCoordinatedNounClause = makeCoordinatedClauseTypeGuard<NounClause, "noun">("noun");

export const RelativeClauseDependentWordType = [
    "adverb",
    "pronoun"
] as const;
export type RelativeClauseDependentWord = ElementReference<typeof RelativeClauseDependentWordType[number]>;
export interface RelativeClause extends Clause {
    clauseType: "relative";
    dependentWord?: RelativeClauseDependentWord;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: that I wrote and that sold well
export type FunctionalRelativeClause = SingleOrCoordinatedClause<RelativeClause, "relative">;
export const isRelativeClause = makeClauseTypeGuard<RelativeClause>("relative");
export const isCoordinatedRelativeClause = makeCoordinatedClauseTypeGuard<RelativeClause, "relative">("relative");

export interface AdverbialClause extends Clause {
    clauseType: "adverbial";
    dependentWord?: ElementReference<"subordinator">;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: after he ate lunch but before he returned to work
export type FunctionalAdverbialClause = SingleOrCoordinatedClause<AdverbialClause, "adverbial">;
export const isAdverbialClause = makeClauseTypeGuard<AdverbialClause>("adverbial");
export const isCoordinatedAdverbialClause = makeCoordinatedClauseTypeGuard<AdverbialClause, "adverbial">("adverbial");
//#endregion

export type Sentence = FunctionalIndependentClause;