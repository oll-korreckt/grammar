import {
    ElementId,
    ElementMapper,
    ElementType,
    PartOfSpeech,
    PartOfSpeechType,
    CoordinatedPartOfSpeech,
    Phrase,
    PhraseType,
    PhraseGuard,
    CoordinatedPhrase,
    CoordinatedNounPhrase,
    Clause,
    ClauseType,
    ClauseGuard,
    CoordinatedClause
} from "./_types";

//#region ElementInit
type ElementInit = {
    [key in Exclude<ElementType, "word">]: (id: ElementId) => ElementMapper<key>;
}

function makePosInit<T extends PartOfSpeechType>(posType: T): (id: ElementId) => ElementMapper<T> {
    return (id) => {
        const output: PartOfSpeech = { id: id, posType: posType };
        return output as ElementMapper<T>;
    };
}

function makeCoordPosInit<T extends PartOfSpeechType>(posType: T): (id: ElementId) => CoordinatedPartOfSpeech<T> {
    return (id) => {
        const output: CoordinatedPartOfSpeech<T> = {
            id: id,
            posType: posType,
            itemType: posType
        };
        return output;
    };
}

function makePhraseInit<T extends PhraseType>(phraseType: T): (id: ElementId) => ElementMapper<PhraseGuard<T>> {
    return (id) => {
        const output: Phrase = {
            id: id,
            phraseType: phraseType
        };
        return output as any;
    };
}

function initCoordinatedNounPhrase(id: ElementId): CoordinatedNounPhrase {
    return {
        id: id,
        phraseType: "noun",
        itemType: "noun | pronoun | nounPhrase"
    };
}

function makeCoordPhraseInit<T extends PhraseType & PartOfSpeechType>(phraseType: T): (id: ElementId) => CoordinatedPhrase<T> {
    return (id) => {
        const output: CoordinatedPhrase<T> = {
            id: id,
            phraseType: phraseType,
            itemType: `${phraseType} | ${phraseType}Phrase`
        };
        return output;
    };
}

function makeClauseInit<T extends ClauseType>(clauseType: T): (id: ElementId) => ElementMapper<ClauseGuard<T>> {
    return (id) => {
        const output: Clause = {
            id: id,
            clauseType: clauseType
        };
        return output as any;
    };
}

function makeCoordClauseInit<T extends ClauseType>(clauseType: T): (id: ElementId) => CoordinatedClause<T> {
    return (id) => {
        const output: CoordinatedClause<T> = {
            id: id,
            clauseType: clauseType,
            itemType: clauseType
        };
        return output;
    };
}

const valueInit: ElementInit = {
    // noun
    noun: makePosInit("noun"),
    coordinatedNoun: makeCoordPosInit("noun"),
    nounPhrase: makePhraseInit("noun"),
    coordinatedNounPhrase: initCoordinatedNounPhrase,
    // pronoun
    pronoun: makePosInit("pronoun"),
    coordinatedPronoun: makeCoordPosInit("pronoun"),
    // verb
    verb: makePosInit("verb"),
    coordinatedVerb: makeCoordPosInit("verb"),
    verbPhrase: makePhraseInit("verb"),
    coordinatedVerbPhrase: makeCoordPhraseInit("verb"),
    // infinitive
    infinitive: makePosInit("infinitive"),
    coordinatedInfinitive: makeCoordPosInit("infinitive"),
    infinitivePhrase: makePhraseInit("infinitive"),
    coordinatedInfinitivePhrase: makeCoordPhraseInit("infinitive"),
    // participle
    participle: makePosInit("participle"),
    coordinatedParticiple: makeCoordPosInit("participle"),
    participlePhrase: makePhraseInit("participle"),
    coordinatedParticiplePhrase: makeCoordPhraseInit("participle"),
    // gerund
    gerund: makePosInit("gerund"),
    coordinatedGerund: makeCoordPosInit("gerund"),
    gerundPhrase: makePhraseInit("gerund"),
    coordinatedGerundPhrase: makeCoordPhraseInit("gerund"),
    // adjective
    adjective: makePosInit("adjective"),
    coordinatedAdjective: makeCoordPosInit("adjective"),
    adjectivePhrase: makePhraseInit("adjective"),
    coordinatedAdjectivePhrase: makeCoordPhraseInit("adjective"),
    // adverb
    adverb: makePosInit("adverb"),
    coordinatedAdverb: makeCoordPosInit("adverb"),
    adverbPhrase: makePhraseInit("adverb"),
    coordinatedAdverbPhrase: makeCoordPhraseInit("adverb"),
    // preposition
    preposition: makePosInit("preposition"),
    coordinatedPreposition: makeCoordPosInit("preposition"),
    prepositionPhrase: makePhraseInit("preposition"),
    coordinatedPrepositionPhrase: makeCoordPhraseInit("preposition"),
    // determiner
    determiner: makePosInit("determiner"),
    coordinatedDeterminer: makeCoordPosInit("determiner"),
    // coordinator
    coordinator: makePosInit("coordinator"),
    // subordinator
    subordinator: makePosInit("subordinator"),
    // clauses
    independentClause: makeClauseInit("independent"),
    coordinatedIndependentClause: makeCoordClauseInit("independent"),
    nounClause: makeClauseInit("noun"),
    coordinatedNounClause: makeCoordClauseInit("noun"),
    relativeClause: makeClauseInit("relative"),
    coordinatedRelativeClause: makeCoordClauseInit("relative"),
    adverbialClause: makeClauseInit("adverbial"),
    coordinatedAdverbialClause: makeCoordClauseInit("adverbial")
};

export function initElement<T extends Exclude<ElementType, "word">>(type: T, id: ElementId): ElementMapper<T> {
    return valueInit[type](id) as ElementMapper<T>;
}
//#endregion