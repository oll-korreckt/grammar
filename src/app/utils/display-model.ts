import { ElementDefinitionMapper, ElementId, ElementReference, ElementType, ElementCategory, getElementCategory, getElementDefinition } from "@domain/language";
import { DiagramState, DiagramStateItem } from "./diagram-state";
import { ElementDisplayInfo } from "./element-display-info";
import { WordViewCategory } from "./word-view-context";

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
        const category = getElementCategory(item.type);
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
    const parentCategory = getElementCategory(parentItem.type);
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

function _getWordCount(indices: WordIndices): number {
    let output = 0;
    indices.forEach((index) => {
        const incr = Array.isArray(index) ? index[1] - index[0] + 1 : 1;
        output += incr;
    });
    return output;
}

function _isComplete(element: DisplayModelElement): boolean {
    if (element.type === "word") {
        return true;
    }
    if (element.properties === undefined) {
        return false;
    }
    const info = ElementDisplayInfo.getDisplayInfo(element.type);
    const reqProps = Object.entries(info.properties)
        .filter(([, value]) => value.required === true)
        .map(([key]) => key);
    for (let index = 0; index < reqProps.length; index++) {
        const propName = reqProps[index];
        if (element.properties[propName] === undefined) {
            return false;
        }
    }
    return true;
}

export type Progress = {
    [Key in WordViewCategory]: {
        percentage: number;
        errorItems: ElementId[];
    };
}

type ProgressPreOutputValue = {
    count: number;
    errorItems: ElementId[];
}

export type ProgressPreOutput = {
    wordCount: number;
    partOfSpeech: ProgressPreOutputValue;
    nonIndClause: ProgressPreOutputValue;
    indClause: ProgressPreOutputValue;
}

type IdFunction = (element: DisplayModelElement) => boolean;

function _isWord(element: DisplayModelElement): boolean {
    return element.category === "word";
}

function _isPartOfSpeech(element: DisplayModelElement): boolean {
    return element.category === "partOfSpeech";
}

function _isNonIndClause(element: DisplayModelElement): boolean {
    switch (element.category) {
        case "phrase":
        case "clause":
            // do nothing
            break;
        default:
            return false;
    }
    switch (element.type) {
        case "independentClause":
        case "coordinatedIndependentClause":
            return false;
        default:
            return true;
    }
}

function _isIndClause(element: DisplayModelElement): boolean {
    switch (element.type) {
        case "independentClause":
        case "coordinatedIndependentClause":
            return true;
        default:
            return false;
    }
}

function _isTopLevel(model: DisplayModel, element: DisplayModelElement, idFn: IdFunction): boolean {
    if (element.ref === undefined) {
        return true;
    }
    const parent = model[element.ref];
    return !idFn(parent);
}

function _updateProgressOutput(model: DisplayModel, [id, element]: [ElementId, DisplayModelElement], pOutput: ProgressPreOutputValue, idFn: IdFunction): void {
    if (_isComplete(element)) {
        if (_isTopLevel(model, element, idFn)) {
            const incr = _getWordCount(element.words);
            pOutput.count += incr;
        }
    } else {
        pOutput.errorItems.push(id);
    }
}

function _calcProgress(wordCount: number, itemCount: number, errorItemCount: number): number {
    let output = itemCount * 100 / wordCount;
    for (let index = 0; index < errorItemCount; index++) {
        output *= 0.9;
    }
    return output;
}

function _calcPartOfSpeechProgress({ wordCount, partOfSpeech }: ProgressPreOutput): Progress[keyof Progress] {
    return {
        percentage: _calcProgress(
            wordCount,
            partOfSpeech.count,
            partOfSpeech.errorItems.length
        ),
        errorItems: partOfSpeech.errorItems
    };
}

export function _calcPhraseAndClauseProgress({ wordCount, nonIndClause, indClause }: ProgressPreOutput): Progress[keyof Progress] {
    const indClausePct = _calcProgress(
        wordCount,
        indClause.count,
        indClause.errorItems.length
    );
    const rawNonIndClausePct = _calcProgress(
        wordCount,
        nonIndClause.count,
        nonIndClause.errorItems.length
    );
    const nonIndClausePct = Math.pow(rawNonIndClausePct / 100, 0.4) * 100;
    const percentage = indClausePct === 100 && nonIndClause.errorItems.length === 0
        ? indClausePct
        : (indClausePct + nonIndClausePct) / 2;
    return {
        percentage: percentage,
        errorItems: [...nonIndClause.errorItems, ...indClause.errorItems]
    };
}

function calcProgress(model: DisplayModel): Progress {
    const elements = Object.entries(model);
    const preOutput: ProgressPreOutput = {
        wordCount: 0,
        partOfSpeech: {
            count: 0,
            errorItems: []
        },
        nonIndClause: {
            count: 0,
            errorItems: []
        },
        indClause: {
            count: 0,
            errorItems: []
        }
    };
    for (let index = 0; index < elements.length; index++) {
        const [id, element] = elements[index];
        if (_isWord(element)) {
            preOutput.wordCount++;
        } else if (_isPartOfSpeech(element)) {
            _updateProgressOutput(
                model,
                [id, element],
                preOutput.partOfSpeech,
                _isPartOfSpeech
            );
        } else if (_isNonIndClause(element)) {
            _updateProgressOutput(
                model,
                [id, element],
                preOutput.nonIndClause,
                _isNonIndClause
            );
        } else if (_isIndClause(element)) {
            _updateProgressOutput(
                model,
                [id, element],
                preOutput.indClause,
                _isIndClause
            );
        } else {
            throw `category '${element.category}' is not supported`;
        }
    }
    const partOfSpeech = _calcPartOfSpeechProgress(preOutput);
    const phraseAndClause = _calcPhraseAndClauseProgress(preOutput);
    return {
        partOfSpeech: partOfSpeech,
        phraseAndClause: phraseAndClause
    };
}

function expand(wRng: WordRange): number[] {
    const output: number[] = [];
    const [start, end] = wRng;
    if (start > end) {
        throw "cannot expand WordRange with a starting index greater than an ending index";
    }
    for (let index = start; index < end + 1; index++) {
        output.push(index);
    }
    return output;
}

export const WordRange = {
    expand: expand
};

export const DisplayModel = {
    init: init,
    calcProgress: calcProgress
};