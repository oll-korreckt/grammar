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

export interface Identifiable {
    id: ElementId;
}

export interface Word extends Identifiable {
    lexeme: string;
}

export interface PartOfSpeech extends Identifiable {
    posType?: PartOfSpeechType;
}

export interface CoordinatedPartOfSpeech<
    TPartOfSpeech extends PartOfSpeech,
    TPartOfSpeechType extends PartOfSpeechType>
    extends CoordinatedItems<TPartOfSpeech>, PartOfSpeech {
    posType: TPartOfSpeechType;
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
    words?: Word[];
}
// Coordinated: carnivores, herbivores, and omnivores
export type FunctionalNoun = SingleOrCoordinatedPartOfSpeech<Noun, "noun">;

// Single: he
// Multi: each other
export interface Pronoun extends PartOfSpeech {
    posType: "pronoun";
    words?: Word[];
}
// Coordinated: he and she
export type FunctionalPronoun = SingleOrCoordinatedPartOfSpeech<Pronoun, "pronoun">;

export interface Verb extends PartOfSpeech {
    posType: "verb";
    mainVerb?: Word;
    // Single: will
    // Multi: will have
    auxiliaryVerbs?: Word[];
}
// Coordinated: am running and (am) skipping
export type FunctionalVerb = SingleOrCoordinatedPartOfSpeech<Verb, "verb">;

// Single: unhappy
// Multi: New Yorker
export interface Adjective extends PartOfSpeech {
    posType: "adjective";
    words?: Word[];
}
// Coordinated: energetic yet focused
export type FunctionalAdjective = SingleOrCoordinatedPartOfSpeech<Adjective, "adjective">;

export interface Adverb extends PartOfSpeech {
    posType: "adverb";
    word?: Word;
}
// Coordinated: slowly but surely
export type FunctionalAdverb = SingleOrCoordinatedPartOfSpeech<Adverb, "adverb">;

// Single: for
// Multi: because of
export interface Preposition extends PartOfSpeech {
    posType: "preposition";
    words?: Word[];
}
// Coordinated: in or near
export type FunctionalPreposition = SingleOrCoordinatedPartOfSpeech<Preposition, "preposition">;

// Single: this
// Multi: half of the
export interface Determiner extends PartOfSpeech {
    posType: "determiner";
    words?: Word[];
}
// Coordinated: each and every
export type FunctionalDeterminer = SingleOrCoordinatedPartOfSpeech<Determiner, "determiner">;

// Single: and
// Multi: neither <...> nor <...>
export interface Coordinator extends PartOfSpeech {
    posType: "coordinator";
    words?: Word[];
}

// Single: because
// Multi: even though
export interface Subordinator extends PartOfSpeech {
    posType: "subordinator";
    words?: Word[];
}

export interface Infinitive extends PartOfSpeech {
    posType: "infinitive";
    to?: Word;
    verb?: Word;
}
// Coordinated: to eat and (to) drink
export type FunctionalInfinitive = SingleOrCoordinatedPartOfSpeech<Infinitive, "infinitive">;

export interface Gerund extends PartOfSpeech {
    posType: "gerund";
    word?: Word;
}
// Coordinated: smoking and drinking
export type FunctionalGerund = SingleOrCoordinatedPartOfSpeech<Gerund, "gerund">;

export interface Participle extends PartOfSpeech {
    posType: "participle";
    word?: Word;
}
// Coordinated: broken and shattered
export type FunctionalParticiple = SingleOrCoordinatedPartOfSpeech<Participle, "participle">;

export interface CoordinatedItems<T> extends Identifiable {
    items?: T[];
    conjunction?: Coordinator;
}
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

export interface CoordinatedPhrase<
    TPartOfSpeech extends PartOfSpeech,
    TPhrase extends Phrase,
    TPhraseType extends PhraseType>
    extends CoordinatedItems<TPartOfSpeech | TPhrase>, Phrase {
    phraseType: TPhraseType;
}

type SingleOrCoordinatedPhrase<
    TPartOfSpeech extends PartOfSpeech,
    TPartOfSpeechType extends PartOfSpeechType,
    TPhrase extends Phrase,
    TPhraseType extends PhraseType> =
    | SingleOrCoordinatedPartOfSpeech<TPartOfSpeech, TPartOfSpeechType>
    | TPhrase
    | CoordinatedPhrase<TPartOfSpeech, TPhrase, TPhraseType>;

export type NounPhraseHead =
    | FunctionalNoun
    | FunctionalPronoun
    | CoordinatedItems<NounPhrase | Noun | Pronoun>;
export type NounModifier =
    // the team
    | FunctionalDeterminer
    // the good team
    | FunctionalAdjectivePhrase
    // the only team in the state
    | FunctionalPrepositionPhrase
    // the only team who has a chance
    | FunctionalRelativeClause
    // the defeated team
    | FunctionalParticiplePhrase
    // the team to beat
    | FunctionalInfinitivePhrase
export interface NounPhrase extends Phrase {
    phraseType: "noun";
    head?: FunctionalNoun | FunctionalPronoun;
    modifiers?: NounModifier[];
}
// Coordinated: the ugly horse and the lazy bear
export type FunctionalNounPhrase = SingleOrCoordinatedPhrase<Noun | Pronoun, "noun", NounPhrase, "noun">;

export type SubjectComplement =
    | FunctionalNounPhrase
    | FunctionalNounClause
    | FunctionalAdjectivePhrase
    | FunctionalPrepositionPhrase
export type VerbObject =
    | FunctionalNounPhrase
    | FunctionalNounClause
    | FunctionalGerundPhrase
    | FunctionalInfinitivePhrase;
export type VerbModifier =
    | FunctionalAdverb
    | FunctionalAdverbPhrase
    | FunctionalAdverbialClause
    | FunctionalNounPhrase
    | FunctionalNoun
    | FunctionalPrepositionPhrase
    | FunctionalInfinitivePhrase;
export type VerbComplement = VerbModifier;
export type VerbDirectObjectComplement =
    | FunctionalNounPhrase
    | FunctionalAdjectivePhrase
    | FunctionalInfinitivePhrase
    | FunctionalParticiplePhrase
    | FunctionalNounClause
    | FunctionalRelativeClause
    | FunctionalAdverbialClause;

export interface VerbPhrase extends Phrase {
    phraseType: "verb";
    head?: FunctionalVerb;
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

export type AdjectiveModifier = FunctionalAdverbPhrase;
export type AdjectiveComplement =
    | FunctionalPrepositionPhrase
    | FunctionalInfinitivePhrase
    | FunctionalNounClause;
export interface AdjectivePhrase extends Phrase {
    phraseType: "adjective";
    determiner?: FunctionalDeterminer;
    head?: FunctionalAdjective;
    modifiers?: AdjectiveModifier[];
    complement?: AdjectiveComplement;
}
// Coordinated: very fast and extremely energetic
export type FunctionalAdjectivePhrase = SingleOrCoordinatedPhrase<Adjective, "adjective", AdjectivePhrase, "adjective">;

export interface AdverbPhrase extends Phrase {
    phraseType: "adverb";
    head?: Adverb;
    modifier?: Adverb;
}
// Coordinated: somewhat slowly yet quite efficiently
export type FunctionalAdverbPhrase = SingleOrCoordinatedPhrase<Adverb, "adverb", AdverbPhrase, "adverb">;

export type PrepositionObject = VerbObject;
export interface PrepositionPhrase extends Phrase {
    phraseType: "preposition";
    head?: FunctionalPreposition;
    object?: PrepositionObject;
}
// Coordinated: both on my own and with others
export type FunctionalPrepositionPhrase = SingleOrCoordinatedPhrase<Preposition, "preposition", PrepositionPhrase, "preposition">;

// same composition as VerbPhrase
export interface GerundPhrase extends Phrase {
    phraseType: "gerund";
    head?: FunctionalGerund;
    headModifier?: VerbModifier;
    headCompl?: VerbComplement;
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: smoking cigarettes and drinking beer
export type FunctionalGerundPhrase = SingleOrCoordinatedPhrase<Gerund, "gerund", GerundPhrase, "gerund">;

// same composition as VerbPhrase
export interface InfinitivePhrase extends Phrase {
    phraseType: "infinitive";
    head?: FunctionalInfinitive;
    headModifier?: VerbModifier;
    headCompl?: VerbComplement;
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: to swim laps and (to) run marathons
export type FunctionalInfinitivePhrase = SingleOrCoordinatedPhrase<Infinitive, "infinitive", InfinitivePhrase, "infinitive">;

// same composition as VerbPhrase
export interface ParticiplePhrase extends Phrase {
    phraseType: "participle";
    head?: FunctionalParticiple;
    headModifier?: VerbModifier;
    headCompl?: VerbComplement;
    subjCompl?: SubjectComplement;
    dirObj?: VerbObject;
    dirObjCompl?: VerbDirectObjectComplement;
    indObj?: VerbObject;
}
// Coordinated: clenching his fists yet not saying anything
export type FunctionalParticiplePhrase = SingleOrCoordinatedPhrase<Participle, "participle", ParticiplePhrase, "participle">;
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

export interface CoordinatedClause<
    TClause,
    TClauseType extends ClauseType>
    extends CoordinatedItems<TClause>, Clause {
    clauseType: TClauseType;
}

type SingleOrCoordinatedClause<
    TClause extends Clause,
    TClauseType extends ClauseType> =
    | TClause
    | CoordinatedClause<TClause, TClauseType>;

export type DependentWord = Subordinator | Pronoun;

export type Subject =
    | FunctionalNoun
    | FunctionalNounPhrase
    | FunctionalNounClause
    | FunctionalGerundPhrase
    | FunctionalInfinitivePhrase;

export type Predicate = FunctionalVerbPhrase;
export interface IndependentClause extends Clause {
    clauseType: "independent";
    subject?: Subject;
    predicate?: Predicate;
}
export type FunctionalIndependentClause = SingleOrCoordinatedClause<IndependentClause, "independent">;

// sometimes the dependent word also acts as a subject or object of the clause
export interface NounClause extends Clause {
    clauseType: "noun";
    dependentWord?: Subordinator | Pronoun;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: wherever we decide to go and whatever we decide to do
export type FunctionalNounClause = SingleOrCoordinatedClause<NounClause, "noun">;

export interface RelativeClause extends Clause {
    clauseType: "relative";
    dependentWord?: Adverb | Pronoun;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: that I wrote and that sold well
export type FunctionalRelativeClause = SingleOrCoordinatedClause<RelativeClause, "relative">;

export interface AdverbialClause extends Clause {
    clauseType: "adverbial";
    dependentWord?: Subordinator;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: after he ate lunch but before he returned to work
export type FunctionalAdverbialClause = SingleOrCoordinatedClause<AdverbialClause, "adverbial">;
//#endregion

export type Sentence = FunctionalIndependentClause;