import { ElementDefinitionMapper, ElementId, ElementReference, ElementType, getElementDefinition } from "@domain/language";
import { DiagramState, DiagramStateItem } from "./diagram-state";

type ElementCategory = Extract<keyof DisplayModel, "word" | "partOfSpeech" | "phrase" | "clause">;

export type DisplayModel = {
    word: ElementId[];
    partOfSpeech: ElementId[];
    phrase: ElementId[];
    clause: ElementId[];
    elements: {
        [key: string]: {
            category: ElementCategory;
            words: number[];
        };
    };
}

function init(state: DiagramState): DisplayModel {
    const output: DisplayModel = {
        word: [],
        partOfSpeech: [],
        phrase: [],
        clause: [],
        elements: {}
    };
    state.wordOrder.forEach((wordId, index) => {
        _processWord(output, state, wordId, index);
    });
    return output;
}

function _processWord(model: DisplayModel, state: DiagramState, wordId: ElementId, index: number): void {
    model.elements[wordId] = {
        category: "word",
        words: [index]
    };
    const parentRef = DiagramState.getTypedItem(state, "word", wordId).ref;
    _processElement(model, state, parentRef, wordId, index);
}

function _processElement(model: DisplayModel, state: DiagramState, parentId: ElementId | undefined, childId: ElementId, index: number): void {
    const childCategory = model.elements[childId].category;
    // add child to top level items if it has no parent and then exit
    if (parentId === undefined) {
        _addToCategory(model, childCategory, childId);
        return;
    }
    const parentItem = DiagramState.getItem(state, parentId);
    const parentCategory = _getCategory(parentItem.type);
    // add child to top level items if it is in a different category than parent
    if (parentCategory !== childCategory) {
        _addToCategory(model, childCategory, childId);
    }

    // exit if parent does not display the child
    if (!_displaysChild(parentItem, childId)) {
        _addToCategory(model, childCategory, childId);
        return;
    }

    if (model.elements[parentId] === undefined) {
        // create parent element if it does not exist
        model.elements[parentId] = {
            category: parentCategory,
            words: [index]
        };
    } else {
        // update parent element if it does exist
        const element = model.elements[parentId];
        if (!element.words.includes(index)) {
            element.words.push(index);
        }
    }

    // hand off to _processElement
    _processElement(model, state, parentItem.ref, parentId, index);
}

function _getCategory(type: ElementType): ElementCategory {
    switch (type) {
        case "word":
            return "word";
        case "noun":
        case "coordinatedNoun":
        case "pronoun":
        case "coordinatedPronoun":
        case "verb":
        case "coordinatedVerb":
        case "infinitive":
        case "coordinatedInfinitive":
        case "participle":
        case "coordinatedParticiple":
        case "gerund":
        case "coordinatedGerund":
        case "adjective":
        case "coordinatedAdjective":
        case "adverb":
        case "coordinatedAdverb":
        case "preposition":
        case "coordinatedPreposition":
        case "determiner":
        case "coordinatedDeterminer":
        case "coordinator":
        case "subordinator":
            return "partOfSpeech";
        case "nounPhrase":
        case "coordinatedNounPhrase":
        case "verbPhrase":
        case "coordinatedVerbPhrase":
        case "adjectivePhrase":
        case "coordinatedAdjectivePhrase":
        case "adverbPhrase":
        case "coordinatedAdverbPhrase":
        case "prepositionPhrase":
        case "coordinatedPrepositionPhrase":
        case "gerundPhrase":
        case "coordinatedGerundPhrase":
        case "infinitivePhrase":
        case "coordinatedInfinitivePhrase":
        case "participlePhrase":
        case "coordinatedParticiplePhrase":
            return "phrase";
        case "independentClause":
        case "coordinatedIndependentClause":
        case "nounClause":
        case "coordinatedNounClause":
        case "relativeClause":
        case "coordinatedRelativeClause":
        case "adverbialClause":
        case "coordinatedAdverbialClause":
            return "clause";
    }
}

function _addToCategory(model: DisplayModel, category: ElementCategory, id: ElementId): void {
    if (!model[category].includes(id)) {
        model[category].push(id);
    }
}

function _displaysChild(parentItem: DiagramStateItem, childId: string): boolean {
    const displayProps = getDisplayProperties(parentItem.type);
    const defProps = getElementDefinition(parentItem.type as Exclude<ElementType, "word">);
    const valueCast = parentItem.value as unknown as Record<string, undefined | ElementReference | ElementReference[]>;
    for (let index = 0; index < displayProps.length; index++) {
        const propName = displayProps[index];
        const propValue = valueCast[propName];
        if (propValue === undefined) {
            continue;
        }
        const [isArray] = defProps[propName];
        const propArray = isArrayProp(isArray, propValue) ? propValue : [propValue];
        if (propArray.map((x) => x.id).includes(childId)) {
            return true;
        }
    }
    return false;
}

function isArrayProp(isArray: boolean, propValue: ElementReference | ElementReference[]): propValue is ElementReference[] {
    return isArray;
}

type DisplayProperties = {
    [Key in ElementType]: Key extends "word" ? ["lexeme"] : Exclude<keyof ElementDefinitionMapper<Exclude<Key, "word">>, number>[];
}

const coordDispProps: ["coordinator", "items"] = ["coordinator", "items"];
const displayProperties: DisplayProperties = {
    word: ["lexeme"],
    noun: ["words"],
    coordinatedNoun: coordDispProps,
    pronoun: ["words"],
    coordinatedPronoun: coordDispProps,
    nounPhrase: ["head"],
    coordinatedNounPhrase: coordDispProps,
    nounClause: ["dependentWord", "subject", "predicate"],
    coordinatedNounClause: coordDispProps,
    verb: ["mainVerb", "auxiliaryVerbs"],
    coordinatedVerb: coordDispProps,
    verbPhrase: ["head"],
    coordinatedVerbPhrase: coordDispProps,
    adjective: ["words"],
    coordinatedAdjective: coordDispProps,
    adjectivePhrase: ["head"],
    coordinatedAdjectivePhrase: coordDispProps,
    relativeClause: ["dependentWord", "subject", "predicate"],
    coordinatedRelativeClause: coordDispProps,
    adverb: ["word"],
    coordinatedAdverb: coordDispProps,
    adverbPhrase: ["head"],
    coordinatedAdverbPhrase: coordDispProps,
    adverbialClause: ["dependentWord", "subject", "predicate"],
    coordinatedAdverbialClause: coordDispProps,
    preposition: ["words"],
    coordinatedPreposition: coordDispProps,
    prepositionPhrase: ["head"],
    coordinatedPrepositionPhrase: coordDispProps,
    determiner: ["words"],
    coordinatedDeterminer: coordDispProps,
    coordinator: ["words"],
    subordinator: ["words"],
    infinitive: ["to", "verb"],
    coordinatedInfinitive: coordDispProps,
    infinitivePhrase: ["head"],
    coordinatedInfinitivePhrase: coordDispProps,
    gerund: ["word"],
    coordinatedGerund: coordDispProps,
    gerundPhrase: ["head"],
    coordinatedGerundPhrase: coordDispProps,
    participle: ["word"],
    coordinatedParticiple: coordDispProps,
    participlePhrase: ["head"],
    coordinatedParticiplePhrase: coordDispProps,
    independentClause: ["subject", "predicate"],
    coordinatedIndependentClause: coordDispProps
};

function getDisplayProperties(type: ElementType): string[] {
    return displayProperties[type];
}

export const DisplayModel = {
    init: init
};