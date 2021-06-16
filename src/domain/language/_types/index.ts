import { PartOfSpeechType, CoordinatedPartOfSpeechType, PhraseGuard, PhraseType, CoordinatedPhraseType, ClauseGuard, ClauseType, CoordClauseType, ElementType, Word } from "./utils";
import { PosMapper, CoordPosMapper } from "./part-of-speech";
import { PhraseMapper, CoordPhraseMapper } from "./phrase";
import { ClauseMapper, CoordClauseMapper, FunctionalIndependentClause } from "./clause";

export type {
    ElementId,
    Identifiable,
    PartOfSpeechType,
    PhraseType,
    ClauseType,
    ElementType,
    ElementReference,
    Word,
    isWord,
    WordReference
} from "./utils";
export type {
    PartOfSpeech,
    CoordinatedPartOfSpeech,
    Coordinated,
    // noun
    Noun,
    isNoun,
    isCoordinatedNoun,
    // pronoun
    Pronoun,
    isPronoun,
    isCoordinatedPronoun,
    // verb
    Verb,
    isVerb,
    isCoordinatedVerb,
    // adjective
    Adjective,
    isAdjective,
    isCoordinatedAdjective,
    // adverb
    Adverb,
    isAdverb,
    isCoordinatedAdverb,
    // preposition
    Preposition,
    isPreposition,
    isCoordinatedPreposition,
    // infinitive
    Infinitive,
    isInfinitive,
    isCoordinatedInfinitive,
    // participle
    Participle,
    isParticiple,
    isCoordinatedParticiple,
    // gerund
    Gerund,
    isGerund,
    isCoordinatedGerund,
    // determiner
    Determiner,
    isDeterminer,
    isCoordinatedDeterminer,
    // coordinator
    Coordinator,
    // subordinator
    Subordinator
} from "./part-of-speech";
export type {
    Phrase,
    CoordinatedPhrase,
    // noun
    NounPhrase,
    NounPhraseHeadTypes,
    NounPhraseHead,
    NounModiferTypes,
    NounModifier,
    isNounPhrase,
    CoordinatedNounPhrase,
    isCoordinatedNounPhrase,
    // verb
    VerbPhrase,
    VerbModifierTypes,
    VerbModifier,
    VerbComplementTypes,
    VerbComplement,
    VerbDirectObjectComplementTypes,
    VerbDirectObjectComplement,
    isVerbPhrase,
    isCoordinatedVerbPhrase,
    // adjective
    AdjectivePhrase,
    AdjectiveComplementTypes,
    AdjectiveComplement,
    isAdjectivePhrase,
    isCoordinatedAdjectivePhrase,
    // adverb
    AdverbPhrase,
    isAdverbPhrase,
    isCoordinatedAdverbPhrase,
    // preposition
    PrepositionPhrase,
    PrepositionObjectTypes,
    PrepositionObject,
    isPrepositionPhrase,
    isCoordinatedPrepositionPhrase,
    // gerund
    GerundPhrase,
    isGerundPhrase,
    isCoordinatedGerundPhrase,
    // infinitive
    InfinitivePhrase,
    isInfinitivePhrase,
    isCoordinatedInfinitivePhrase,
    // participle
    ParticiplePhrase,
    isParticiplePhrase,
    isCoordinatedParticiplePhrase
} from "./phrase";
export type {
    Clause,
    CoordinatedClause,
    // subject
    SubjectTypes,
    Subject,
    // predicate
    Predicate,
    // independent
    IndependentClause,
    isIndependentClause,
    isCoordinatedIndependentClause,
    // noun
    NounClause,
    NounClauseDependentWordType,
    NounClauseDependentWord,
    isNounClause,
    isCoordinatedNounClause,
    // relative
    RelativeClause,
    RelativeClauseDependentWordType,
    RelativeClauseDependentWord,
    isRelativeClause,
    isCoordinatedRelativeClause,
    // adverbial
    AdverbialClause,
    isAdverbialClause,
    isCoordinatedAdverbialClause
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

export type Sentence = FunctionalIndependentClause;