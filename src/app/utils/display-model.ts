import { ElementDefinitionMapper, ElementId, ElementReference, ElementType, ElementCategory, getElementDefinition, elementTypeLists } from "@domain/language";
import { DiagramState, DiagramStateItem } from "./diagram-state";
import { ElementDisplayInfo } from "./element-display-info";

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
        const category = ElementCategory.getElementCategory(item.type);
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
    const parentCategory = ElementCategory.getElementCategory(parentItem.type);
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
    [Key in "category" | "syntax"]: {
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
    category: ProgressPreOutputValue;
    syntax: {
        nonIndClause: ProgressPreOutputValue;
        indClause: ProgressPreOutputValue;
    };
}

type IdFunction = (element: DisplayModelElement) => boolean;

function _createWordIdFn(): IdFunction {
    return (element) => element.type === "word";
}

function _createCategoryIdFn(): IdFunction {
    const catId = new Set<ElementType>([
        "word",
        ...elementTypeLists.partOfSpeech
    ]);
    return ({ type }) => catId.has(type);
}

function _isIndClause(type: ElementType): boolean {
    switch (type) {
        case "independentClause":
        case "coordinatedIndependentClause":
            return true;
        default:
            return false;
    }
}

function _createSyntaxNonIndClauseIdFn(): IdFunction {
    const coordPosId = new Set<ElementType>([...elementTypeLists.coordPartOfSpeech]);
    return (element) => {
        switch (element.category) {
            case "partOfSpeech": {
                return coordPosId.has(element.type);
            }
            case "phrase": {
                return true;
            }
            case "clause": {
                return !_isIndClause(element.type);
            }
            default: {
                return false;
            }
        }
    };
}

function _createSyntaxIndClauseIdFn(): IdFunction {
    return ({ type }) => _isIndClause(type);
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

function _calcCategoryProgress({ wordCount, category }: ProgressPreOutput): Progress[keyof Progress] {
    return {
        percentage: _calcProgress(
            wordCount,
            category.count,
            category.errorItems.length
        ),
        errorItems: category.errorItems
    };
}

export function _calcSyntaxProgress({ wordCount, syntax: { nonIndClause, indClause } }: ProgressPreOutput): Progress[keyof Progress] {
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
        category: {
            count: 0,
            errorItems: []
        },
        syntax: {
            nonIndClause: {
                count: 0,
                errorItems: []
            },
            indClause: {
                count: 0,
                errorItems: []
            }
        }
    };
    const isWord = _createWordIdFn();
    const isCategory = _createCategoryIdFn();
    const isSyntaxNonIndClause = _createSyntaxNonIndClauseIdFn();
    const isSyntaxIndClause = _createSyntaxIndClauseIdFn();
    for (let index = 0; index < elements.length; index++) {
        const [id, element] = elements[index];
        if (isWord(element)) {
            preOutput.wordCount++;
        } else if (isCategory(element)) {
            _updateProgressOutput(
                model,
                [id, element],
                preOutput.category,
                isCategory
            );
        } else if (isSyntaxNonIndClause(element)) {
            _updateProgressOutput(
                model,
                [id, element],
                preOutput.syntax.nonIndClause,
                isSyntaxNonIndClause
            );
        } else if (isSyntaxIndClause(element)) {
            _updateProgressOutput(
                model,
                [id, element],
                preOutput.syntax.indClause,
                isSyntaxIndClause
            );
        } else {
            throw `category '${element.category}' is not supported`;
        }
    }
    const category = _calcCategoryProgress(preOutput);
    const syntax = _calcSyntaxProgress(preOutput);
    return {
        category: category,
        syntax: syntax
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