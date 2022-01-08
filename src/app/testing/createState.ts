import { DiagramState, TypedDiagramStateItem, WhitespaceLexeme, WordLexeme } from "@app/utils";
import { ClauseGuard, ClauseType, ElementId, ElementMapper, PartOfSpeechType, PhraseGuard, PhraseType, Word, ElementType } from "@domain/language";

function createWord(lexeme: string, id?: ElementId): [ElementId, Word] {
    const wordId = id === undefined ? lexeme : id;
    return [wordId, { id: wordId, lexeme: lexeme }];
}

function createPos<T extends PartOfSpeechType>(type: T, pos: ElementMapper<T>): [ElementId, ElementMapper<T>] {
    return [pos.id, pos];
}

function createPhrase<T extends PhraseType>(type: T, phrase: ElementMapper<PhraseGuard<T>>): [ElementId, ElementMapper<PhraseGuard<T>>] {
    return [phrase.id, phrase];
}

function createClause<T extends ClauseType>(type: T, clause: ElementMapper<ClauseGuard<T>>): [ElementId, ElementMapper<ClauseGuard<T>>] {
    return [clause.id, clause];
}

function createItem<T extends ElementType>(type: T, value: ElementMapper<T>, ref?: ElementId): Record<string, TypedDiagramStateItem<T>> {
    return {
        [value.id]: {
            type: type,
            value: value,
            ref: ref
        }
    };
}

export function createWordLexeme(id: ElementId): WordLexeme {
    return {
        type: "word",
        id: id
    };
}

export const Ids = {
    the1: "the1",
    quick: "quick",
    brown: "brown",
    fox: "fox",
    jumps: "jumps",
    over: "over",
    the2: "the2",
    lazy: "lazy",
    dog: "dog",
    the1Det: "the1Det",
    quickBrownAdj: "quickBrownAdj",
    foxNoun: "foxNoun",
    jumpsVerb: "jumpsVerb",
    overPrep: "overPrep",
    the2Det: "the2Det",
    lazyAdj: "lazyAdj",
    dogNoun: "dogNoun",
    quickBrownAdjPhrase: "quickBrownAdjPhrase",
    foxNounPhrase: "foxNounPhrase",
    lazyAdjPhrase: "lazyAdjPhrase",
    dogNounPhrase: "dogNounPhrase",
    overPrepPhrase: "overPrepPhrase",
    jumpsVerbPhrase: "jumpsVerbPhrase",
    indClause: "indClause"
};

export function createState(): DiagramState {
    const [the1Id, the1Word] = createWord("The", "the1");
    const [quickId, quickWord] = createWord("quick");
    const [brownId, brownWord] = createWord("brown");
    const [foxId, foxWord] = createWord("fox");
    const [jumpsId, jumpsWord] = createWord("jumps");
    const [overId, overWord] = createWord("over");
    const [the2Id, the2Word] = createWord("the", "the2");
    const [lazyId, lazyWord] = createWord("lazy");
    const [dogId, dogWord] = createWord("dog");
    const [the1DetId, the1Det] = createPos("determiner", {
        id: "the1Det",
        posType: "determiner",
        words: [{ id: the1Id, type: "word" }]
    });
    const [quickBrownAdjId, quickBrownAdj] = createPos("adjective", {
        id: "quickBrownAdj",
        posType: "adjective",
        words: [
            { id: quickId, type: "word" },
            { id: brownId, type: "word" }
        ]
    });
    const [foxNounId, foxNoun] = createPos("noun", {
        id: "foxNoun",
        posType: "noun",
        words: [{ id: foxId, type: "word" }]
    });
    const [jumpsVerbId, jumpsVerb] = createPos("verb", {
        id: "jumpsVerb",
        posType: "verb",
        mainVerb: [{ id: jumpsId, type: "word" }]
    });
    const [overPrepId, overPrep] = createPos("preposition", {
        id: "overPrep",
        posType: "preposition",
        words: [{ id: overId, type: "word" }]
    });
    const [the2DetId, the2Det] = createPos("determiner", {
        id: "the2Det",
        posType: "determiner",
        words: [{ id: the2Id, type: "word" }]
    });
    const [lazyAdjId, lazyAdj] = createPos("adjective", {
        id: "lazyAdj",
        posType: "adjective",
        words: [{ id: lazyId, type: "word" }]
    });
    const [dogNounId, dogNoun] = createPos("noun", {
        id: "dogNoun",
        posType: "noun",
        words: [{ id: dogId, type: "word" }]
    });
    const [quickBrownAdjPhraseId, quickBrownAdjPhrase] = createPhrase("adjective", {
        id: "quickBrownAdjPhrase",
        phraseType: "adjective",
        determiner: { id: the1DetId, type: "determiner" },
        head: { id: quickBrownAdjId, type: "adjective" }
    });
    const [foxNounPhraseId, foxNounPhrase] = createPhrase("noun", {
        id: "foxNounPhrase",
        phraseType: "noun",
        modifiers: [{ id: quickBrownAdjPhraseId, type: "adjectivePhrase" }],
        head: { id: foxNounId, type: "noun" }
    });
    const [lazyAdjPhraseId, lazyAdjPhrase] = createPhrase("adjective", {
        id: "lazyAdjPhrase",
        phraseType: "adjective",
        determiner: { id: the2DetId, type: "determiner" },
        head: { id: lazyAdjId, type: "adjective" }
    });
    const [dogNounPhraseId, dogNounPhrase] = createPhrase("noun", {
        id: "dogNounPhrase",
        phraseType: "noun",
        modifiers: [{ id: lazyAdjPhraseId, type: "adjectivePhrase" }],
        head: { id: dogNounId, type: "noun" }
    });
    const [overPrepPhraseId, overPrepPhrase] = createPhrase("preposition", {
        id: "overPrepPhrase",
        phraseType: "preposition",
        object: { id: dogNounPhraseId, type: "nounPhrase" },
        head: { id: overPrepId, type: "preposition" }
    });
    const [jumpsVerbPhraseId, jumpsVerbPhrase] = createPhrase("verb", {
        id: "jumpsVerbPhrase",
        phraseType: "verb",
        headModifier: { id: overPrepPhraseId, type: "prepositionPhrase" },
        head: { id: jumpsVerbId, type: "verb" }
    });
    const [indClauseId, indClause] = createClause("independent", {
        id: "indClause",
        clauseType: "independent",
        subject: { id: foxNounPhraseId, type: "nounPhrase" },
        predicate: { id: jumpsVerbPhraseId, type: "verbPhrase" }
    });
    const space: WhitespaceLexeme = {
        type: "whitespace",
        lexeme: " "
    };
    return {
        lexemes: [
            createWordLexeme(the1Id),
            space,
            createWordLexeme(quickId),
            space,
            createWordLexeme(brownId),
            space,
            createWordLexeme(foxId),
            space,
            createWordLexeme(jumpsId),
            space,
            createWordLexeme(overId),
            space,
            createWordLexeme(the2Id),
            space,
            createWordLexeme(lazyId),
            space,
            createWordLexeme(dogId)
        ],
        elements: {
            ...createItem("word", the1Word, the1DetId),
            ...createItem("word", quickWord, quickBrownAdjId),
            ...createItem("word", brownWord, quickBrownAdjId),
            ...createItem("word", foxWord, foxNounId),
            ...createItem("word", jumpsWord, jumpsVerbId),
            ...createItem("word", overWord, overPrepId),
            ...createItem("word", the2Word, the2DetId),
            ...createItem("word", lazyWord, lazyAdjId),
            ...createItem("word", dogWord, dogNounId),
            ...createItem("determiner", the1Det, quickBrownAdjPhraseId),
            ...createItem("adjective", quickBrownAdj, quickBrownAdjPhraseId),
            ...createItem("noun", foxNoun, foxNounPhraseId),
            ...createItem("verb", jumpsVerb, jumpsVerbPhraseId),
            ...createItem("preposition", overPrep, overPrepPhraseId),
            ...createItem("determiner", the2Det, lazyAdjPhraseId),
            ...createItem("adjective", lazyAdj, lazyAdjPhraseId),
            ...createItem("noun", dogNoun, dogNounPhraseId),
            ...createItem("adjectivePhrase", quickBrownAdjPhrase, foxNounPhraseId),
            ...createItem("nounPhrase", foxNounPhrase, indClauseId),
            ...createItem("verbPhrase", jumpsVerbPhrase, indClauseId),
            ...createItem("prepositionPhrase", overPrepPhrase, jumpsVerbPhraseId),
            ...createItem("adjectivePhrase", lazyAdjPhrase, dogNounPhraseId),
            ...createItem("nounPhrase", dogNounPhrase, overPrepPhraseId),
            ...createItem("independentClause", indClause)
        }
    };
}