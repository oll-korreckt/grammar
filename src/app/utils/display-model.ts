import { ElementDefinitionMapper, ElementId, ElementReference, ElementType, getElementDefinition } from "@domain/language";
import { DiagramState, DiagramStateItem } from "./diagram-state";

export type ElementCategory = "word" | "partOfSpeech" | "phrase" | "clause";
export type WordRange = [number, number];
export type WordIndices = (number | WordRange)[];

export type DisplayModelElement = {
    category: ElementCategory;
    type: ElementType;
    words: WordIndices;
    ref?: ElementId;
    properties?: Record<string, ElementId[]>;
}

export type TypedDisplayModelElement<Type extends ElementType> = Type extends "word" ? {
    category: ElementCategory;
    type: Type;
    words: [number];
    ref?: ElementId;
} : {
    category: ElementCategory;
    type: Type;
    words: WordIndices;
    ref?: ElementId;
    properties: {
        [Key in keyof ElementDefinitionMapper<Exclude<Type, "word">>]?: ElementId[];
    };
}

export type DisplayModel = {
    [key: string]: DisplayModelElement;
}

function init(state: DiagramState): DisplayModel {
    const output: DisplayModel = {};
    state.wordOrder.forEach((wordId, index) => {
        _processWord(output, state, wordId, index);
    });
    const allElements = Object.entries(state.elements);
    for (let index = 0; index < allElements.length; index++) {
        const [key, item] = allElements[index];
        if (output[key] !== undefined) {
            continue;
        }
        const category = _getCategory(item.type);
        output[key] = {
            category: category,
            type: item.type,
            words: []
        };
    }
    return output;
}

function _processWord(model: DisplayModel, state: DiagramState, wordId: ElementId, index: number): void {
    model[wordId] = {
        category: "word",
        type: "word",
        words: [index]
    };
    const parentRef = DiagramState.getTypedItem(state, "word", wordId).ref;
    _processElement(model, state, parentRef, wordId, index);
}

function _processElement(model: DisplayModel, state: DiagramState, parentRef: ElementId | undefined, childId: ElementId, index: number): void {
    if (parentRef === undefined) {
        return;
    }
    model[childId].ref = parentRef;
    const parentItem = DiagramState.getItem(state, parentRef);
    const parentCategory = _getCategory(parentItem.type);
    if (model[parentRef] === undefined) {
        // create element if it does not exist
        model[parentRef] = {
            type: parentItem.type,
            category: parentCategory,
            words: []
        };
    }
    const displayElement = model[parentRef];
    _appendWord(displayElement.words, index);
    const referencingProperties = _getReferencingProperties(parentItem, childId);
    if (displayElement.properties === undefined) {
        displayElement.properties = {};
    }
    const dispElProps = displayElement.properties;
    referencingProperties.forEach((propName) => {
        if (dispElProps[propName] === undefined) {
            dispElProps[propName] = [childId];
        } else if (!dispElProps[propName].includes(childId)) {
            dispElProps[propName].push(childId);
        }
    });
    _processElement(model, state, parentItem.ref, parentRef, index);
}

export function _appendWord(words: WordIndices, newWord: number): void {
    if (words.length === 0) {
        words.push(newWord);
        return;
    }
    const lastEntry = words[words.length - 1];
    if (Array.isArray(lastEntry)) {
        const [, end] = lastEntry;
        if (newWord === end + 1) {
            lastEntry[1] = newWord;
            return;
        }
    } else {
        if (newWord === lastEntry + 1) {
            words[words.length - 1] = [lastEntry, newWord];
            return;
        }
    }
    words.push(newWord);
}

type CategoryObj = {
    [Key in ElementType]: ElementCategory;
}

function _getCategory(type: ElementType): ElementCategory {
    const catObj: CategoryObj = {
        word: "word",
        noun: "partOfSpeech",
        coordinatedNoun: "partOfSpeech",
        pronoun: "partOfSpeech",
        coordinatedPronoun: "partOfSpeech",
        verb: "partOfSpeech",
        coordinatedVerb: "partOfSpeech",
        infinitive: "partOfSpeech",
        coordinatedInfinitive: "partOfSpeech",
        participle: "partOfSpeech",
        coordinatedParticiple: "partOfSpeech",
        gerund: "partOfSpeech",
        coordinatedGerund: "partOfSpeech",
        adjective: "partOfSpeech",
        coordinatedAdjective: "partOfSpeech",
        adverb: "partOfSpeech",
        coordinatedAdverb: "partOfSpeech",
        preposition: "partOfSpeech",
        coordinatedPreposition: "partOfSpeech",
        determiner: "partOfSpeech",
        coordinatedDeterminer: "partOfSpeech",
        coordinator: "partOfSpeech",
        subordinator: "partOfSpeech",
        nounPhrase: "phrase",
        coordinatedNounPhrase: "phrase",
        verbPhrase: "phrase",
        coordinatedVerbPhrase: "phrase",
        adjectivePhrase: "phrase",
        coordinatedAdjectivePhrase: "phrase",
        adverbPhrase: "phrase",
        coordinatedAdverbPhrase: "phrase",
        prepositionPhrase: "phrase",
        coordinatedPrepositionPhrase: "phrase",
        gerundPhrase: "phrase",
        coordinatedGerundPhrase: "phrase",
        infinitivePhrase: "phrase",
        coordinatedInfinitivePhrase: "phrase",
        participlePhrase: "phrase",
        coordinatedParticiplePhrase: "phrase",
        independentClause: "clause",
        coordinatedIndependentClause: "clause",
        nounClause: "clause",
        coordinatedNounClause: "clause",
        relativeClause: "clause",
        coordinatedRelativeClause: "clause",
        adverbialClause: "clause",
        coordinatedAdverbialClause: "clause"
    };
    return catObj[type];
}

function _getReferencingProperties(item: DiagramStateItem, id: ElementId): string[] {
    const output: string[] = [];
    const propNames = Object.keys(getElementDefinition(item.type as Exclude<ElementType, "word">));
    const value = item.value as unknown as Record<string, undefined | ElementReference | ElementReference[]>;
    for (let index = 0; index < propNames.length; index++) {
        const propName = propNames[index];
        const propValue = value[propName];
        if (_containsReference(propValue, id)) {
            output.push(propName);
        }
    }
    return output;
}

function _containsReference(propValue: undefined | ElementReference | ElementReference[], id: ElementId): boolean {
    if (propValue === undefined) {
        return false;
    } else if (Array.isArray(propValue)) {
        for (let index = 0; index < propValue.length; index++) {
            if (propValue[index].id === id) {
                return true;
            }
        }
        return false;
    } else {
        return propValue.id === id;
    }
}

export const DisplayModel = {
    init: init
};