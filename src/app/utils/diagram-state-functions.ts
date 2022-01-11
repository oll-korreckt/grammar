import { ElementId, ElementRecord, ElementReference, ElementType, getElementDefinition, Identifiable } from "@domain/language";
import { initElement } from "@domain/language/element-init";
import { SimpleObject } from "@lib/utils";
import { DiagramState, DiagramStateItem } from ".";
import { getNewItemId } from "./diagram-state";

function addItem(state: DiagramState, type: Exclude<ElementType, "word">): DiagramState {
    const newId = getNewItemId();
    const newValue = initElement(type, newId);
    const newItem: DiagramStateItem = {
        type: type,
        value: newValue
    };
    const output = cloneElements(state);
    output.elements = {
        ...output.elements,
        [newId]: newItem
    };
    return output;
}

function castToRecord(value: Identifiable): ElementRecord {
    return value as unknown as ElementRecord;
}

function castToIdentifiable(value: ElementRecord): Identifiable {
    return value as unknown as Identifiable;
}

function cloneElements(state: DiagramState): DiagramState {
    return {
        ...state,
        elements: SimpleObject.clone(state.elements)
    };
}

// used to remove childId from any parent properties containing it
function _deleteParentToChildReferences(elements: DiagramState["elements"], parentId: ElementId, childId: ElementId): void {
    const newParentValue: ElementRecord = {};
    const parent = elements[parentId];
    const entries = Object.entries(castToRecord(parent.value));
    let newPropCnt = 0;
    for (let index = 0; index < entries.length; index++) {
        const [key, value] = entries[index];
        if (value === undefined) {
            continue;
        }
        if (typeof value === "string") {
            newParentValue[key] = value;
        } else if (Array.isArray(value)) {
            const newValue = value.filter((ref) => ref.id !== childId);
            if (newValue.length > 0) {
                newParentValue[key] = newValue;
                newPropCnt++;
            }
        } else if (value.id !== childId) {
            newParentValue[key] = value;
            newPropCnt++;
        }
    }
    parent.value = castToIdentifiable(newParentValue);
    if (newPropCnt === 0) {
        delete elements[parentId];
        if (parent.ref !== undefined) {
            _deleteParentToChildReferences(elements, parent.ref, parentId);
        }
    }
}

function _deleteIfEmpty(elements: DiagramState["elements"], id: ElementId): void {
    const { ref, value } = elements[id];
    const props = _getElementReferences(value);
    if (props.length === 0) {
        delete elements[id];
        if (ref !== undefined) {
            _deleteParentToChildReferences(elements, ref, id);
        }
    }
}

function _deleteParentToChildReference(elements: DiagramState["elements"], parentId: ElementId, key: string, childId: ElementId): void {
    const parent = elements[parentId];
    const parentValue = castToRecord(parent.value);
    const property = parentValue[key];
    if (property === undefined) {
        throw `Property '${key}' does not exist`;
    }
    if (typeof property === "string") {
        throw `Property '${key}' is a string and cannot be deleted`;
    }
    if (Array.isArray(property)) {
        const index = property.findIndex(({ id }) => id === childId);
        if (index === -1) {
            throw `Parent property '${key}' does not reference child '${childId}'`;
        }
        const newProperty = [
            ...property.slice(0, index),
            ...property.slice(index + 1)
        ];
        if (newProperty.length > 0) {
            parentValue[key] = newProperty;
        } else {
            delete parentValue[key];
            _deleteIfEmpty(elements, parentId);
        }
    } else {
        if (property.id !== childId) {
            throw `Parent property '${key}' does not reference child '${childId}'`;
        }
        delete parentValue[key];
        _deleteIfEmpty(elements, parentId);
    }
}

// used to delete ref property from any of the childIds
function _deleteChildToParentReference(elements: DiagramState["elements"], parentId: ElementId, ...childIds: ElementId[]): void {
    childIds.forEach((childId) => {
        const childItem = elements[childId];
        if (childItem.ref !== parentId) {
            throw `Child '${childIds}' is not presently referenced by '${parentId}'`;
        }
        delete childItem.ref;
    });
}

function _getElementReferences(item: Identifiable): ElementReference[] {
    const ids = new Set<ElementId>();
    const output: ElementReference[] = [];
    const values = Object.values(castToRecord(item));
    for (let index = 0; index < values.length; index++) {
        const value = values[index];
        if (value === undefined) {
            continue;
        }
        if (Array.isArray(value)) {
            value.filter((v) => !ids.has(v.id)).forEach((v) => {
                output.push(v);
                ids.add(v.id);
            });
        } else if (typeof value === "object" && !ids.has(value.id)) {
            output.push(value);
            ids.add(value.id);
        }
    }
    return output;
}

function _deleteItem(elements: DiagramState["elements"], id: ElementId): void {
    const item = elements[id];
    if (item.type === "word") {
        throw "Cannot delete words";
    }
    // delete property values from any parent items referencing this id
    if (item.ref !== undefined) {
        _deleteParentToChildReferences(elements, item.ref, id);
    }
    // delete references from any children that are referenced by the item
    const childIds = _getElementReferences(item.value).map((ref) => ref.id);
    _deleteChildToParentReference(elements, id, ...childIds);
    // delete item itself
    delete elements[id];
}

function deleteItem(state: DiagramState, id: ElementId): DiagramState {
    const output = cloneElements(state);
    _deleteItem(output.elements, id);
    return output;
}

function _addParentToChildReference(elements: DiagramState["elements"], parentId: ElementId, key: string, childId: ElementId): void {
    const childType = elements[childId].type;
    const newReference: ElementReference = {
        id: childId,
        type: childType
    };
    const parentItem = elements[parentId];
    const parentValue = castToRecord(parentItem.value);
    const property = parentValue[key];
    if (property === undefined) {
        const [isArray] = getElementDefinition(parentItem.type as Exclude<ElementType, "word">)[key];
        elements[parentId].value = castToIdentifiable({
            ...parentValue,
            [key]: isArray ? [newReference] : newReference
        });
    } else {
        if (typeof property === "string") {
            throw `'${key}' property of '${parentId}' is a string`;
        }
        if (Array.isArray(property)) {
            if (property.map(({ id }) => id).includes(childId)) {
                throw `'${key}' proeprty of '${parentId}' already references '${childId}'`;
            }
            elements[parentId].value = castToIdentifiable({
                ...parentValue,
                [key]: [...property, newReference]
            });
        } else {
            _deleteChildToParentReference(elements, parentId, property.id);
            elements[parentId].value = castToIdentifiable({
                ...parentValue,
                [key]: newReference
            });
        }
    }
}

function _addChildToParentReference(elements: DiagramState["elements"], parentId: ElementId, childId: ElementId): void {
    const childItem = elements[childId];
    if (childItem.ref === parentId) {
        throw `Child '${childId}' already references '${parentId}'`;
    }
    elements[childId] = {
        ...childItem,
        ref: parentId
    };
    // child is referencing another element so need to remove that reference
    if (childItem.ref !== undefined) {
        _deleteParentToChildReferences(elements, childItem.ref, childId);
    }
}

function addReference(state: DiagramState, parentId: ElementId, key: string, childId: ElementId): DiagramState {
    const output = cloneElements(state);
    _addParentToChildReference(output.elements, parentId, key, childId);
    _addChildToParentReference(output.elements, parentId, childId);
    return output;
}

function deleteReference(state: DiagramState, parentId: ElementId, key: string, childId: ElementId): DiagramState {
    const output = cloneElements(state);
    _deleteParentToChildReference(output.elements, parentId, key, childId);
    _selectiveDeleteChildToParentReferences(output.elements, parentId, childId);
    return output;
}

function deleteProperty(state: DiagramState, id: ElementId, key: string): DiagramState {
    const output = cloneElements(state);
    const outputItem = output.elements[id];
    const outputValue = castToRecord(outputItem.value);
    const property = outputValue[key];
    if (property === undefined) {
        throw `Property '${key}' does not exist on element '${id}'`;
    }
    if (typeof property === "string") {
        throw `Property '${key}' of element '${id}' is a string and cannot be deleted`;
    }
    const childIds: ElementId[] = Array.isArray(property)
        ? property.map((ref) => ref.id)
        : [property.id];
    delete outputValue[key];
    output.elements[id].value = castToIdentifiable(outputValue);
    _selectiveDeleteChildToParentReferences(output.elements, id, ...childIds);
    delete outputValue[key];
    output.elements[id] = {
        ...output.elements[id],
        value: castToIdentifiable(outputValue)
    };
    return output;
}

function _selectiveDeleteChildToParentReferences(elements: DiagramState["elements"], parentId: ElementId, ...childIds: ElementId[]): void {
    const parentItem = elements[parentId];
    const remainingReferences: Set<ElementId> = parentItem !== undefined
        ? new Set(_getElementReferences(parentItem.value).map(({ id }) => id))
        : new Set();
    childIds.forEach((id) => {
        if (!remainingReferences.has(id)) {
            if (elements[id].ref !== parentId) {
                throw `Element '${id}' does not presently reference '${parentId}'`;
            }
            delete elements[id].ref;
        }
    });
}

export const DiagramStateFunctions = {
    addItem: addItem,
    deleteItem: deleteItem,
    deleteProperty: deleteProperty,
    addReference: addReference,
    deleteReference: deleteReference
};

export const Private = {
    _selectiveDeleteChildToParentReferences: _selectiveDeleteChildToParentReferences
};