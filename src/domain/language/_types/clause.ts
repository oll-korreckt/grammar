import { Identifiable, ElementReference, ClauseType, ClauseGuard, CoordClauseType } from "./utils";
import { Coordinated } from "./part-of-speech";

type CoordClauseGuard<Type extends CoordClauseType> = Type;
export type ClauseMapper<Type extends ClauseGuard<ClauseType>> =
    Type extends ClauseGuard<"independent"> ? IndependentClause
    : Type extends ClauseGuard<"noun"> ? NounClause
    : Type extends ClauseGuard<"relative"> ? RelativeClause
    : Type extends ClauseGuard<"adverbial"> ? AdverbialClause
    : never;

export type CoordClauseMapper<Type extends CoordClauseType> =
    Type extends CoordClauseGuard<"coordinatedIndependentClause"> ? CoordinatedClause<"independent">
    : Type extends CoordClauseGuard<"coordinatedNounClause"> ? CoordinatedClause<"noun">
    : Type extends CoordClauseGuard<"coordinatedRelativeClause"> ? CoordinatedClause<"relative">
    : Type extends CoordClauseGuard<"coordinatedAdverbialClause"> ? CoordinatedClause<"adverbial">
    : never;

export interface Clause extends Identifiable {
    clauseType?: ClauseType;
}

function makeClauseTypeGuard<TClauseType extends ClauseType>(clauseType: TClauseType): (element: Identifiable) => element is ClauseMapper<ClauseGuard<TClauseType>> {
    return function (element: Identifiable): element is ClauseMapper<ClauseGuard<TClauseType>> {
        return (element as Clause).clauseType === clauseType;
    };
}

export interface CoordinatedClause<TClauseType extends ClauseType>
    extends Coordinated<ClauseMapper<ClauseGuard<TClauseType>>>, Clause {
    itemType: TClauseType;
    clauseType: TClauseType;
}

function makeCoordinatedClauseTypeGuard<TClauseType extends ClauseType>(
    clauseType: TClauseType): (element: Identifiable) => element is CoordinatedClause<TClauseType> {
    return function (element: Identifiable): element is CoordinatedClause<TClauseType> {
        const typed = element as CoordinatedClause<TClauseType>;
        return typed.clauseType === clauseType && typed.itemType === clauseType;
    };
}

type SingleOrCoordinatedClause<TClauseType extends ClauseType> =
    | ClauseMapper<ClauseGuard<TClauseType>>
    | CoordinatedClause<TClauseType>;

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
export type FunctionalIndependentClause = SingleOrCoordinatedClause<"independent">;
export const isIndependentClause = makeClauseTypeGuard("independent");
export const isCoordinatedIndependentClause = makeCoordinatedClauseTypeGuard("independent");

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
export type FunctionalNounClause = SingleOrCoordinatedClause<"noun">;
export const isNounClause = makeClauseTypeGuard("noun");
export const isCoordinatedNounClause = makeCoordinatedClauseTypeGuard("noun");

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
export type FunctionalRelativeClause = SingleOrCoordinatedClause<"relative">;
export const isRelativeClause = makeClauseTypeGuard("relative");
export const isCoordinatedRelativeClause = makeCoordinatedClauseTypeGuard("relative");

export interface AdverbialClause extends Clause {
    clauseType: "adverbial";
    dependentWord?: ElementReference<"subordinator">;
    subject?: Subject;
    predicate?: Predicate;
}
// Coordinated: after he ate lunch but before he returned to work
export type FunctionalAdverbialClause = SingleOrCoordinatedClause<"adverbial">;
export const isAdverbialClause = makeClauseTypeGuard("adverbial");
export const isCoordinatedAdverbialClause = makeCoordinatedClauseTypeGuard("adverbial");