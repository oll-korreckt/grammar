import { DiagramState, DiagramStateItem, TypedDiagramStateItem } from "@app/utils";
import { scan, Word, ElementId, ElementType, ElementDefinitionMapper, getElementDefinition } from "@domain/language";
import { initElement } from "@domain/language/element-init";
import { ElementReference, Identifiable } from "@domain/language/_types/utils";
import { AtomicChange, SimpleObject } from "@lib/utils";
import { ChangeMap } from "./change-map";
import { SerialId } from "./serial-id";

function getChildReferences(parent: Identifiable): [string, ElementReference | ElementReference[]][] {
    return Object.entries(parent).filter(([, value]) => typeof value === "object");
}

function getNewItemId(): string {
    return SerialId.getNextId();
}

export class Diagram {
    static fromText(text: string): Diagram {
        const baseState: DiagramState = {};
        let wordCnt = 0;
        scan(text).forEach(({ lexeme, tokenType }) => {
            if (tokenType === "word") {
                const word: Word = {
                    id: wordCnt.toString(),
                    lexeme: lexeme
                };
                baseState[word.id] = {
                    value: word,
                    type: "word",
                    refs: []
                };
                wordCnt++;
            }
        });
        return new Diagram(baseState);
    }

    private currState: DiagramState;
    private newState: DiagramState;
    private changes: AtomicChange[][] = [];
    private changeMaps: ChangeMap[] = [];
    private currentChange?: number;

    private constructor(state: DiagramState) {
        this.currState = state;
        this.newState = SimpleObject.clone(state);
    }

    getItem(id: ElementId): DiagramStateItem {
        const output = this.newState[id];
        if (output === undefined) {
            throw `Element ${id} does not exist`;
        }
        return output;
    }

    private getChangeMap(): ChangeMap {
        if (this.currentChange !== undefined) {
            return this.changeMaps[this.currentChange];
        }
        return {};
    }

    getTypedItem<T extends ElementType>(type: T, id: ElementId): TypedDiagramStateItem<T> {
        const output = this.getItem(id);
        if (output.type !== type) {
            throw `Element ${id} does not have type ${type}`;
        }
        return output as TypedDiagramStateItem<T>;
    }

    stageChange(...change: AtomicChange[]): void {
        let currChangeMap = this.getChangeMap();
        change.forEach((x) => {
            currChangeMap = ChangeMap.update(
                currChangeMap,
                x.key,
                x.type
            );
            this.newState = AtomicChange.apply(this.newState, x);
        });
        if (this.currentChange !== undefined) {
            const currChg = this.currentChange;
            const filterFn = (_: any, index: number) => index <= currChg;
            this.changes = this.changes.filter(filterFn);
            this.changeMaps = this.changeMaps.filter(filterFn);
            this.changes.push(change);
            this.changeMaps.push(currChangeMap);
            this.currentChange++;
        } else {
            this.changes = [change];
            this.changeMaps = [currChangeMap];
            this.currentChange = 0;
        }
    }

    createAddReference<TElementType extends Exclude<ElementType, "word">, TKey extends keyof ElementDefinitionMapper<TElementType>>(parentType: TElementType, parentId: ElementId, key: TKey, childId: ElementId): AtomicChange[] {
        const keyStr = key as string;
        const parent = this.getTypedItem(parentType, parentId);
        const child = this.getItem(childId);
        // make change to parent
        let parentChange: AtomicChange;
        const parentChangeKey = [parentId, "value", keyStr];
        const [isArray, childTypes] = getElementDefinition(parentType)[key] as unknown as [boolean, ElementId[]];
        if (!childTypes.includes(child.type)) {
            throw `'${key}' property of '${parentType}' element is not allowed to reference a '${child.type}' element`;
        }
        const newRef: ElementReference = {
            id: childId,
            type: child.type
        };
        const currVal: undefined | ElementReference | ElementReference[] = (parent.value as any)[keyStr];
        if (currVal === undefined) {
            const newVal = isArray ? [newRef] : newRef;
            parentChange = AtomicChange.createSet(
                parentChangeKey,
                currVal,
                newVal
            );
        } else {
            if (Array.isArray(currVal)) {
                if (currVal.map((ref) => ref.id).includes(childId)) {
                    throw `'${keyStr}' property of '${parentId}' element of type ${parentType} already contains a reference to '${childId}' element`;
                }
                parentChange = AtomicChange.createSet(
                    parentChangeKey,
                    currVal,
                    [...currVal, newRef]
                );
            } else {
                if (currVal.id === childId) {
                    throw `'${keyStr}' property of '${parentId}' element of type ${parentType} already references '${childId}' element`;
                }
                parentChange = AtomicChange.createSet(
                    parentChangeKey,
                    currVal,
                    newRef
                );
            }
        }
        // make changes to child if necessary
        if (!child.refs.includes(parentId)) {
            const childChange = AtomicChange.createSet(
                [childId, "refs"],
                child.refs,
                [...child.refs, parentId]
            );
            return [parentChange, childChange];
        }
        return [parentChange];
    }

    createDeleteReference<TElementType extends Exclude<ElementType, "word">, TKey extends keyof ElementDefinitionMapper<TElementType>>(parentType: TElementType, parentId: ElementId, key: TKey, childId: ElementId): AtomicChange[] {
        const keyStr = key as string;
        const parent = this.getTypedItem(parentType, parentId);
        // make change to parent
        let parentChange: AtomicChange;
        const parentChangeKey = [parentId, "value", keyStr];
        const currVal: undefined | ElementReference | ElementReference[] = (parent.value as any)[keyStr];
        if (currVal === undefined) {
            throw `element '${parentId}' does not have a '${keyStr}' property`;
        }
        if (Array.isArray(currVal)) {
            const newVal = currVal.filter((ref) => ref.id !== childId);
            switch (newVal.length) {
                case currVal.length - 1:
                    // do nothing
                    break;
                case currVal.length:
                    throw `'${keyStr}' of '${parentId}' element does not contain a reference to '${childId}'`;
                default:
                    throw `'${keyStr}' of '${parentId}' element contains multiple references to '${childId}'`;
            }

            if (newVal.length === 0) {
                parentChange = AtomicChange.createDelete(
                    parentChangeKey,
                    currVal
                );
            } else {
                parentChange = AtomicChange.createSet(
                    parentChangeKey,
                    currVal,
                    newVal
                );
            }
        } else {
            if (currVal.id !== childId) {
                throw `'${keyStr}' of '${parentId}' element does not reference '${childId}'`;
            }
            parentChange = AtomicChange.createDelete(
                parentChangeKey,
                currVal
            );
        }
        // remove child ref
        const childRefs = this.getItem(childId).refs;
        const newChildRefs = childRefs.filter((ref) => ref !== parentId);
        switch (newChildRefs.length) {
            case childRefs.length - 1:
                // do nothing
                break;
            case childRefs.length:
                throw `'${childId}' element is not referenced by '${parentId}' element`;
            default:
                throw `'${childId}' element is referenced by '${parentId}' multiple times`;
        }
        const childChange = AtomicChange.createSet(
            [childId, "refs"],
            childRefs,
            newChildRefs
        );
        return [parentChange, childChange];
    }

    createAddItem(type: Exclude<ElementType, "word">): AtomicChange {
        const id = getNewItemId();
        const value = initElement(type, id);
        const newValue: DiagramStateItem = {
            value: value,
            type: type,
            refs: []
        };
        return AtomicChange.createSet(
            [value.id],
            undefined,
            newValue
        );
    }

    createDeleteItem(id: ElementId): AtomicChange[] {
        const item = this.getItem(id);
        if (item.type === "word") {
            throw "Cannot delete words";
        }
        const output: AtomicChange[] = [];
        // delete property values from any parent items referencing this id
        item.refs.forEach((parentId) => {
            const parentItem = this.getItem(parentId);
            if (parentItem.type === "word") {
                throw "'word' element type cannot reference other elements";
            }
            const entries: [string, ElementReference | ElementReference[]][] = getChildReferences(parentItem.value);
            for (let index = 0; index < entries.length; index++) {
                const [key, currValue] = entries[index];
                if (Array.isArray(currValue)) {
                    const newValue = currValue.filter((eRef) => eRef.id !== id);
                    if (newValue.length !== currValue.length) {
                        output.push(AtomicChange.createSet(
                            [parentId, "value", key],
                            currValue,
                            newValue
                        ));
                    }
                } else {
                    if (currValue.id === id) {
                        output.push(AtomicChange.createDelete(
                            [parentId, "value", key],
                            currValue
                        ));
                    }
                }
            }
        });
        // delete references from any children that are referenced by the item
        const childIds = new Set(getChildReferences(item.value).map(([, value]) => value).flat().map((value) => value.id));
        childIds.forEach((childId) => {
            const currVal = this.getItem(childId).refs;
            const newVal = currVal.filter((ref) => ref !== id);
            if (newVal.length !== currVal.length) {
                output.push(AtomicChange.createSet(
                    [childId, "refs"],
                    currVal,
                    newVal
                ));
            }
        });
        // delete the item itself
        const itemDelete = AtomicChange.createDelete(
            [id],
            item
        );
        output.push(itemDelete);
        return output;
    }

    undoChange(): void {
        if (!this.canUndo() || this.currentChange === undefined) {
            throw "cannot perform undo";
        }
        const change = this.changes[this.currentChange];
        this.newState = AtomicChange.applyInverse(this.newState, ...change);
        this.currentChange = this.currentChange > 0 ? this.currentChange - 1 : undefined;
    }

    canUndo(): boolean {
        return this.currentChange !== undefined;
    }

    redoChange(): void {
        if (!this.canRedo()) {
            throw "cannot perform redo";
        }
        if (this.currentChange !== undefined) {
            const change = this.changes[this.currentChange + 1];
            this.newState = AtomicChange.apply(this.newState, ...change);
            this.currentChange++;
        } else {
            const change = this.changes[0];
            this.newState = AtomicChange.apply(this.newState, ...change);
            this.currentChange = 0;
        }
    }

    canRedo(): boolean {
        if (this.currentChange !== undefined) {
            return this.currentChange < this.changes.length - 1;
        }
        return this.changes.length > 0;
    }

    createChild(): Diagram {
        return new Diagram(SimpleObject.clone(this.newState));
    }

    importState(state: Diagram): void {
        const change = ChangeMap.extractChanges(
            state.getChangeMap(),
            state.currState,
            state.newState
        );
        this.stageChange(...change);
    }
}