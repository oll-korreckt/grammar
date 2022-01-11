import { ElementId, ElementRecord, ElementReference, ElementType, getElementDefinition, Identifiable } from "@domain/language";
import { initElement } from "@domain/language/element-init";
import { SimpleObject } from "@lib/utils";
import { DiagramState, DiagramStateItem, getNewItemId } from ".";

function addItem(state: DiagramState, type: Exclude<ElementType, "word">): DiagramState {
    const newId = getNewItemId();
    const newValue = initElement(type, newId);
    const newItem: DiagramStateItem = {
        type: type,
        value: newValue
    };
    const output = SimpleObject.clone(state);
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

// used to remove childId from any parent properties containing it
function deleteParentToChildReferences(parent: Identifiable, childId: ElementId): Identifiable {
    const output: ElementRecord = {};
    const entries = Object.entries(castToRecord(parent));
    for (let index = 0; index < entries.length; index++) {
        const [key, value] = entries[index];
        if (value === undefined) {
            continue;
        }
        if (typeof value === "string") {
            output[key] = value;
        } else if (Array.isArray(value)) {
            const newValue = value.filter((ref) => ref.id !== childId);
            if (newValue.length > 0) {
                output[key] = newValue;
            }
        } else if (value.id !== childId) {
            output[key] = value;
        }
    }
    return castToIdentifiable(output);
}

function deleteParentToChildReference(parent: Identifiable, key: string, childId: ElementId): Identifiable {
    const output = castToRecord(parent);
    const property = output[key];
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
            output[key] = newProperty;
        } else {
            delete output[key];
        }
    } else {
        if (property.id !== childId) {
            throw `Parent property '${key}' does not reference child '${childId}'`;
        }
        delete output[key];
    }
    return castToIdentifiable(output);
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

function getElementReferences(item: Identifiable): ElementReference[] {
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

function deleteItem(state: DiagramState, id: ElementId): DiagramState {
    const output: DiagramState = SimpleObject.clone(state);
    const item = DiagramState.getItem(state, id);
    if (item.type === "word") {
        throw "Cannot delete words";
    }
    // delete property values from any parent items referencing this id
    if (item.ref !== undefined) {
        const newParent = DiagramState.getItem(output, item.ref);
        newParent.value = deleteParentToChildReferences(newParent.value, id);
        output.elements[item.ref] = newParent;
    }
    // delete references from any children that are referenced by the item
    const childIds = getElementReferences(item.value).map((ref) => ref.id);
    _deleteChildToParentReference(output.elements, id, ...childIds);
    // delete item itself
    delete output.elements[id];
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
        elements[childItem.ref].value = deleteParentToChildReferences(elements[childItem.ref].value, childId);
    }
}

function addReference(state: DiagramState, parentId: ElementId, key: string, childId: ElementId): DiagramState {
    const output = SimpleObject.clone(state);
    _addParentToChildReference(output.elements, parentId, key, childId);
    _addChildToParentReference(output.elements, parentId, childId);
    return output;
}

function deleteReference(state: DiagramState, parentId: ElementId, key: string, childId: ElementId): DiagramState {
    const output = SimpleObject.clone(state);
    output.elements[parentId].value = deleteParentToChildReference(output.elements[parentId].value, key, childId);
    _selectiveDeleteChildToParentReferences(output.elements, parentId, childId);
    return output;
}

function deleteProperty(state: DiagramState, id: ElementId, key: string): DiagramState {
    const output = SimpleObject.clone(state);
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
    const parentValue = elements[parentId].value;
    const remainingReferences = new Set(getElementReferences(parentValue).map(({ id }) => id));
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