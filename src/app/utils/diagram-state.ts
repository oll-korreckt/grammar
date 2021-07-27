import { SerialId } from "@app/tricky-components/serial-id";
import { ElementDefinitionMapper, ElementId, ElementMapper, ElementReference, ElementType, getElementDefinition, Identifiable, scan, Word } from "@domain/language";
import { initElement } from "@domain/language/element-init";
import { DefinitionMapper } from "@domain/language/_types/utils";
import { AtomicChange } from "@lib/utils";

export type DiagramStateItem = {
    value: Identifiable;
    type: ElementType;
    ref?: ElementId;
}

export type TypedDiagramStateItem<T extends ElementType> = {
    value: ElementMapper<T>;
    type: T;
    ref?: ElementId;
}

export type DiagramState = {
    wordOrder: ElementId[];
    elements: {
        [key: string]: DiagramStateItem;
    };
}

function getNewItemId(): string {
    return SerialId.getNextId();
}

function fromText(text: string): DiagramState {
    const output: DiagramState = {
        wordOrder: [],
        elements: {}
    };
    scan(text).forEach(({ lexeme, tokenType }) => {
        if (tokenType === "word") {
            const word: Word = {
                id: getNewItemId(),
                lexeme: lexeme
            };
            output.elements[word.id] = {
                value: word,
                type: "word"
            };
            output.wordOrder.push(word.id);
        }
    });
    return output;
}

function getItem(state: DiagramState, id: ElementId): DiagramStateItem {
    const output = state.elements[id];
    if (output === undefined) {
        throw `Element ${id} does not exist`;
    }
    return output;
}

function getTypedItem<T extends ElementType>(state: DiagramState, type: T, id: ElementId): TypedDiagramStateItem<T> {
    const output = getItem(state, id);
    if (output.type !== type) {
        throw `Element ${id} does not have type ${type}`;
    }
    return output as TypedDiagramStateItem<T>;
}

function getElementReferences<T extends Exclude<ElementType, "word">>(type: T, value: ElementMapper<T>): ElementReference[] {
    const output: ElementReference[] = [];
    const def = getElementDefinition(type);
    const entries = Object.entries(def);
    for (let index = 0; index < entries.length; index++) {
        const [key, [isArray]] = entries[index];
        const propValue = (value as any)[key] as undefined | ElementReference | ElementReference[];
        if (propValue === undefined) {
            continue;
        }
        else if (isArrayReference(isArray, propValue)) {
            output.push(...propValue);
        } else {
            output.push(propValue);
        }
    }
    return output;
}

function getWordIndex(state: DiagramState, id: ElementId): number {
    const output = state.wordOrder.indexOf(id);
    if (output === -1) {
        throw `Id '${id}' is not a word`;
    }
    return output;
}

function createWordSorter(state: DiagramState): (x: ElementId, y: ElementId) => number {
    return (x, y) => {
        const xIndex = getWordIndex(state, x);
        const yIndex = getWordIndex(state, y);
        return xIndex - yIndex;
    };
}

function createAddItem(type: Exclude<ElementType, "word">): AtomicChange {
    const id = getNewItemId();
    const value = initElement(type, id);
    const newValue: DiagramStateItem = {
        value: value,
        type: type
    };
    return AtomicChange.createSet(
        ["elements", value.id],
        undefined,
        newValue
    );
}

function _createDeleteParentReference(state: DiagramState, childId: ElementId, parentId: ElementId): AtomicChange {
    const parent = getItem(state, parentId);
    if (parent.type === "word") {
        throw "'word' element type cannot reference other elements";
    }
    const parentDef = getElementDefinition(parent.type);
    const entries = Object.entries(parentDef);
    for (let index = 0; index < entries.length; index++) {
        const [key, [isArray]] = entries[index];
        const currValue = (parent.value as any)[key] as undefined | ElementReference | ElementReference[];
        if (currValue === undefined) {
            continue;
        }
        else if (isArrayReference(isArray, currValue)) {
            const newValue = currValue.filter((x) => x.id !== childId);
            if (newValue.length < currValue.length) {
                return newValue.length === 0
                    ? AtomicChange.createDelete(
                        ["elements", parentId, "value", key],
                        currValue
                    )
                    : AtomicChange.createSet(
                        ["elements", parentId, "value", key],
                        currValue,
                        newValue
                    );
            }
        } else {
            if (currValue.id === childId) {
                return AtomicChange.createDelete(
                    ["elements", parentId, "value", key],
                    currValue
                );
            }
        }
    }
    throw `Parent with id '${parentId}' does not reference child with id '${childId}'`;
}

function createDeleteItem(state: DiagramState, id: ElementId): AtomicChange[] {
    const item = getItem(state, id);
    if (item.type === "word") {
        throw "Cannot delete words";
    }
    const output: AtomicChange[] = [];
    // delete property values from any parent items referencing this id
    if (item.ref !== undefined) {
        const deleteParentRef = _createDeleteParentReference(state, id, item.ref);
        output.push(deleteParentRef);
    }
    // delete references from any children that are referenced by the item
    const childIds = getElementReferences(item.type, item.value as any).map((x) => x.id);
    childIds.forEach((childId) => {
        const currVal = getItem(state, childId).ref;
        output.push(AtomicChange.createDelete(
            ["elements", childId, "ref"],
            currVal
        ));
    });
    // delete the item itself
    const itemDelete = AtomicChange.createDelete(
        ["elements", id],
        item
    );
    output.push(itemDelete);
    return output;
}

function _addReferenceToParent(state: DiagramState, parentId: ElementId, key: string, childId: ElementId): AtomicChange {
    const parent = getItem(state, parentId);
    const child = getItem(state, childId);
    const parentChangeKey = ["elements", parentId, "value", key];
    const [isArray, childTypes] = (getElementDefinition(parent.type as Exclude<ElementType, "word">))[key];
    if (!childTypes.includes(child.type)) {
        throw `'${key}' property of '${parent.type}' element is not allowed to reference a '${child.type}' element`;
    }
    const newRef: ElementReference = {
        id: childId,
        type: child.type
    };
    const currVal: undefined | ElementReference | ElementReference[] = (parent.value as any)[key];
    if (currVal === undefined) {
        const newVal = isArray ? [newRef] : newRef;
        return AtomicChange.createSet(
            parentChangeKey,
            currVal,
            newVal
        );
    } else {
        if (isArrayReference(isArray, currVal)) {
            if (currVal.map((ref) => ref.id).includes(childId)) {
                throw `'${key}' property of '${parentId}' element of type ${parent.type} already contains a reference to '${childId}' element`;
            }
            return AtomicChange.createSet(
                parentChangeKey,
                currVal,
                [...currVal, newRef]
            );
        } else {
            if (currVal.id === childId) {
                throw `'${key}' property of '${parentId}' element of type ${parent.type} already references '${childId}' element`;
            }
            return AtomicChange.createSet(
                parentChangeKey,
                currVal,
                newRef
            );
        }
    }
}

function _addReferenceToChild(state: DiagramState, childId: ElementId, parentId: ElementId): AtomicChange[] {
    const output: AtomicChange[] = [];
    const child = getItem(state, childId);
    output.push(AtomicChange.createSet(
        ["elements", childId, "ref"],
        child.ref,
        parentId
    ));
    if (child.ref !== undefined) {
        output.push(_createDeleteParentReference(state, childId, parentId));
    }
    return output;
}

function createTypedAddReference<TElementType extends Exclude<ElementType, "word">, TKey extends keyof ElementDefinitionMapper<TElementType>>(state: DiagramState, parentType: TElementType, parentId: ElementId, key: TKey, childId: ElementId): AtomicChange[] {
    return createAddReference(state, parentType, parentId, key as string, childId);
}

function createAddReference(state: DiagramState, parentType: Exclude<ElementType, "word">, parentId: ElementId, key: string, childId: ElementId): AtomicChange[] {
    const parentChange = _addReferenceToParent(state, parentId, key as string, childId);
    const childChange = _addReferenceToChild(state, childId, parentId);
    return [parentChange, ...childChange];
}

function _deleteReferenceFromParent(state: DiagramState, parentId: ElementId, key: string, childId: ElementId): AtomicChange {
    const parent = getItem(state, parentId);
    const parentChangeKey = ["elements", parentId, "value", key];
    const currVal: undefined | ElementReference | ElementReference[] = (parent.value as any)[key];
    if (currVal === undefined) {
        throw `element '${parentId}' does not have a '${key}' property`;
    }
    const [isArray] = getElementDefinition(parent.type as Exclude<ElementType, "word">)[key];
    if (isArrayReference(isArray, currVal)) {
        const newVal = currVal.filter((ref) => ref.id !== childId);
        // verify currValArray only contained 1 reference to childId
        switch (newVal.length) {
            case currVal.length - 1:
                // do nothing
                break;
            case currVal.length:
                throw `'${key}' of '${parentId}' element does not contain a reference to '${childId}'`;
            default:
                throw `'${key}' of '${parentId}' element contains multiple references to '${childId}'`;
        }
        if (newVal.length === 0) {
            return AtomicChange.createDelete(parentChangeKey, currVal);
        } else {
            return AtomicChange.createSet(
                parentChangeKey,
                currVal,
                newVal
            );
        }
    } else {
        if (currVal.id !== childId) {
            throw `'${key}' of '${parentId}' element does not reference '${childId}'`;
        }
        return AtomicChange.createDelete(parentChangeKey, currVal);
    }
}

function isArrayReference(isArray: boolean, reference: ElementReference | ElementReference[]): reference is ElementReference[] {
    return isArray;
}

function _deleteReferenceFromChild(state: DiagramState, parentId: ElementId, childId: ElementId): AtomicChange {
    const child = getItem(state, childId);
    if (child.ref === undefined || child.ref !== parentId) {
        throw `'${childId}' element is not referenced by '${parentId}'`;
    }
    return AtomicChange.createDelete(
        ["elements", childId, "ref"],
        child.ref
    );
}

function createTypedDeleteReference<TElementType extends Exclude<ElementType, "word">, TKey extends keyof ElementDefinitionMapper<TElementType>>(state: DiagramState, parentType: TElementType, parentId: ElementId, key: TKey, childId: ElementId): AtomicChange[] {
    return createDeleteReference(state, parentType, parentId, key as string, childId);
}

function createDeleteReference(state: DiagramState, parentType: Exclude<ElementType, "word">, parentId: ElementId, key: string, childId: ElementId): AtomicChange[] {
    if (getElementDefinition(parentType)[key] === undefined) {
        throw `key '${key}' does not exist on type '${parentType}'`;
    }
    const parentChange = _deleteReferenceFromParent(state, parentId, key, childId);
    const childChange = _deleteReferenceFromChild(state, parentId, childId);
    return [parentChange, childChange];
}

function _getDifference(currValue: undefined | ElementReference[], newValue: undefined | ElementReference[]): { delete: boolean[]; add: boolean[]; } {
    const cvPresent = 1 << 0;
    const nvPresent = 1 << 1;
    let state = 0;
    if (currValue !== undefined) {
        state |= cvPresent;
    }
    if (newValue !== undefined) {
        state |= nvPresent;
    }
    switch (state) {
        case cvPresent:
            // delete cv
            return {
                delete: (currValue as ElementReference[]).map(() => true),
                add: []
            };
        case nvPresent:
            // add all values from nv
            return {
                delete: [],
                add: (newValue as ElementReference[]).map(() => true)
            };
        case cvPresent | nvPresent:
            const currValIds = (currValue as ElementReference[]).map((x) => x.id);
            const newValIds = (newValue as ElementReference[]).map((x) => x.id);
            return {
                delete: currValIds.map((x) => !newValIds.includes(x)),
                add: newValIds.map((x) => !currValIds.includes(x))
            };
        case 0:
        default:
            throw "Unexpected state. The current value and new value cannot both be undefined";
    }
}

function _checkNewValueDataType(newValue: undefined | ElementReference | ElementReference[], isArray: boolean, elementTypes: ElementType[]): undefined | ElementReference[] {
    if (newValue !== undefined) {
        const actual = Array.isArray(newValue);
        if (isArray !== actual) {
            throw isArray
                ? "Expected array. Received value."
                : "Expected value. Received array.";
        }
        const refArray = isArrayReference(isArray, newValue) ? newValue : [newValue];
        refArray.forEach((ref) => {
            if (!elementTypes.includes(ref.type)) {
                throw `${ref.id}`;
            }
        });
        return refArray;
    }
}

function setTypedReference<TParentType extends Exclude<ElementType, "word">, TKey extends keyof ElementDefinitionMapper<TParentType>>(state: DiagramState, parentType: TParentType, parentId: ElementId, key: TKey, newValue: DefinitionMapper<ElementDefinitionMapper<TParentType>[TKey]>): AtomicChange[] {
    return setReference(
        state,
        parentType,
        parentId, key as string,
        newValue as unknown as undefined | ElementReference | ElementReference[]
    );
}

function setReference(state: DiagramState, parentType: Exclude<ElementType, "word">, parentId: ElementId, key: string, newValue: undefined | ElementReference | ElementReference[]): AtomicChange[] {
    const [isArray, elementTypes] = getElementDefinition(parentType)[key];
    const newValueArray = _checkNewValueDataType(newValue, isArray, elementTypes);
    const currValue = (getTypedItem(state, parentType, parentId).value as any)[key] as typeof newValue;
    const currValueArray = currValue == undefined
        ? currValue
        : isArrayReference(isArray, currValue) ? currValue : [currValue];
    const diff = _getDifference(currValueArray, newValueArray);
    const output: AtomicChange[] = [];
    for (let index = 0; index < diff.delete.length; index++) {
        if (diff.delete[index]) {
            const { id } = (currValueArray as ElementReference[])[index];
            const deleteChg = _deleteReferenceFromChild(state, parentId, id);
            output.push(deleteChg);
        }
    }
    for (let index = 0; index < diff.add.length; index++) {
        if (diff.add[index]) {
            const { id } = (newValueArray as ElementReference[])[index];
            const addChg = _addReferenceToChild(state, id, parentId);
            output.push(...addChg);
        }
    }
    const changeKey = ["elements", parentId, "value", key];
    const parentChg = newValue === undefined
        ? AtomicChange.createDelete(changeKey, currValue)
        : AtomicChange.createSet(changeKey, currValue, newValue);
    output.push(parentChg);
    return output;
}

export const DiagramState = {
    fromText: fromText,
    getWordIndex: getWordIndex,
    getItem: getItem,
    getTypedItem: getTypedItem,
    getElementReferences: getElementReferences,
    createWordSorter: createWordSorter,
    createAddItem: createAddItem,
    createDeleteItem: createDeleteItem,
    createAddReference: createAddReference,
    createTypedAddReference: createTypedAddReference,
    createDeleteReference: createDeleteReference,
    createTypedDeleteReference: createTypedDeleteReference,
    setTypedReference: setTypedReference,
    setReference: setReference
};