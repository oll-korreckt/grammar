import { Identifiable, ClauseType, ClauseGuard, CoordClauseType, ReferencingElementDefinition, ReferencingElement } from "./utils";
import { Coordinated, CoordinatedDefinition, FunctionalTypeGuard } from "./part-of-speech";
import { FunctionalGerundPhrase, FunctionalInfinitivePhrase, FunctionalNounPhrase, FunctionalVerbPhrase } from "./phrase";

type CoordClauseGuard<Type extends CoordClauseType> = Type;
export type ClauseMapper<Type extends ClauseGuard<ClauseType>> =
    Type extends ClauseGuard<"independent"> ? IndependentClause
    : Type extends ClauseGuard<"noun"> ? NounClause
    : Type extends ClauseGuard<"relative"> ? RelativeClause
    : Type extends ClauseGuard<"adverbial"> ? AdverbialClause
    : never;
export type ClauseDefinitionMapper<Type extends ClauseGuard<ClauseType>> =
    Type extends ClauseGuard<"independent"> ? IndependentClauseDefinition
    : Type extends ClauseGuard<"noun"> ? NounClauseDefinition
    : Type extends ClauseGuard<"relative"> ? RelativeClauseDefinition
    : Type extends ClauseGuard<"adverbial"> ? AdverbialClauseDefinition
    : never;

export type CoordClauseMapper<Type extends CoordClauseType> =
    Type extends CoordClauseGuard<"coordinatedIndependentClause"> ? CoordinatedClause<"independent">
    : Type extends CoordClauseGuard<"coordinatedNounClause"> ? CoordinatedClause<"noun">
    : Type extends CoordClauseGuard<"coordinatedRelativeClause"> ? CoordinatedClause<"relative">
    : Type extends CoordClauseGuard<"coordinatedAdverbialClause"> ? CoordinatedClause<"adverbial">
    : never;
export type CoordClauseDefinitionMapper<Type extends CoordClauseType> =
    Type extends CoordClauseGuard<"coordinatedIndependentClause"> ? CoordinatedDefinition<["independentClause"]>
    : Type extends CoordClauseGuard<"coordinatedNounClause"> ? CoordinatedDefinition<["nounClause"]>
    : Type extends CoordClauseGuard<"coordinatedRelativeClause"> ? CoordinatedDefinition<["relativeClause"]>
    : Type extends CoordClauseGuard<"coordinatedAdverbialClause"> ? CoordinatedDefinition<["adverbialClause"]>
    : never;

export interface Clause extends Identifiable {
    clauseType?: ClauseType;
}

export interface CoordinatedClause<TClauseType extends ClauseType>
    extends Coordinated<[ClauseGuard<TClauseType>]>, Clause {
    itemType: TClauseType;
    clauseType: TClauseType;
}

type ClauseFunctionalTypeGuard<T extends ClauseType> = FunctionalTypeGuard<[
    ClauseGuard<T>,
    `coordinated${Capitalize<ClauseGuard<T>>}`
]>;

export interface IndependentClauseDefinition extends ReferencingElementDefinition<"subject" | "predicate"> {
    subject: [
        false,
        [
            ...FunctionalNounPhrase,
            ...FunctionalNounClause,
            ...FunctionalGerundPhrase,
            ...FunctionalInfinitivePhrase
        ]
    ];
    predicate: [false, FunctionalVerbPhrase];
}

export interface IndependentClause extends Clause, ReferencingElement<IndependentClauseDefinition> {
    clauseType: "independent";
}
export type FunctionalIndependentClause = ClauseFunctionalTypeGuard<"independent">;

export interface DependentClauseDefinition extends IndependentClauseDefinition, ReferencingElementDefinition<"dependentWord"> {
}

// sometimes the dependent word also acts as a subject or object of the clause
export interface NounClauseDefinition extends DependentClauseDefinition {
    dependentWord: [false, ["subordinator", "pronoun", "prepositionPhrase"]];
}
export interface NounClause extends Clause, ReferencingElement<NounClauseDefinition> {
    clauseType: "noun";
}
// Coordinated: wherever we decide to go and whatever we decide to do
export type FunctionalNounClause = ClauseFunctionalTypeGuard<"noun">;

export interface RelativeClauseDefinition extends DependentClauseDefinition {
    dependentWord: [false, ["adverb", "pronoun", "prepositionPhrase"]];
}
export interface RelativeClause extends Clause, ReferencingElement<RelativeClauseDefinition> {
    clauseType: "relative";
}
// Coordinated: that I wrote and that sold well
export type FunctionalRelativeClause = ClauseFunctionalTypeGuard<"relative">;

export interface AdverbialClauseDefinition extends DependentClauseDefinition {
    dependentWord: [false, ["subordinator"]];
}
export interface AdverbialClause extends Clause, ReferencingElement<AdverbialClauseDefinition> {
    clauseType: "adverbial";
}
// Coordinated: after he ate lunch but before he returned to work
export type FunctionalAdverbialClause = ClauseFunctionalTypeGuard<"adverbial">;