import { DiagramState, WhitespaceLexeme } from "@app/utils";
import { ElementCategory, ElementId, ElementRecord, ElementType } from "@domain/language";
import { ElementLabelData, LabelData } from "../LabelView";
import { DisplaySettings } from "./types";

export interface ChainItem {
    id: ElementId;
    type: ElementType;
}

export type SelectedElementChain = ChainItem[];

type ElementFilterFunction = (cat: ElementCategory) => boolean;
type ExpandedFilter = (id: ElementId) => boolean;

function _getAncestors(diagram: DiagramState, id: ElementId, output: ElementId[]): void {
    const { ref } = DiagramState.getItem(diagram, id);
    if (ref !== undefined) {
        output.push(ref);
        _getAncestors(diagram, ref, output);
    }
}

function getAncestors(diagram: DiagramState, id: ElementId): ElementId[] {
    const output: ElementId[] = [];
    _getAncestors(diagram, id, output);
    return output;
}

function getChildren(diagram: DiagramState, id: ElementId): ElementId[] {
    const output = new Set<ElementId>();
    const { value } = DiagramState.getItem(diagram, id);
    const propValues = Object.values(value as unknown as ElementRecord);
    for (let index = 0; index < propValues.length; index++) {
        const property = propValues[index];
        if (property === undefined) {
            continue;
        }
        if (Array.isArray(property)) {
            property.forEach((prop) => {
                output.add(prop.id);
            });
        } else if (typeof property === "object") {
            output.add(property.id);
        }
    }
    return Array.from(output);
}

function getSiblings(diagram: DiagramState, id: ElementId): ElementId[] {
    const { ref } = DiagramState.getItem(diagram, id);
    if (ref === undefined) {
        return [];
    }
    return getChildren(diagram, ref).filter((childId) => childId !== id);
}

function getAncestorSiblings(diagram: DiagramState, id: ElementId): ElementId[] {
    const output: ElementId[] = [];
    const ancestors = getAncestors(diagram, id);
    ancestors.forEach((ancestor) => {
        const siblings = getSiblings(diagram, ancestor);
        output.push(...siblings);
    });
    return output;
}

function getExpandedElements(diagram: DiagramState, expanded: ElementId): ElementId[] {
    return [
        ...getChildren(diagram, expanded),
        ...getSiblings(diagram, expanded),
        ...getAncestorSiblings(diagram, expanded)
    ];
}

function _getDisplayAncestor(diagram: DiagramState, wordId: ElementId, expandedFilter: ExpandedFilter, categoryFilter: ElementFilterFunction): ElementId {
    const elements: ElementId[] = [wordId, ...getAncestors(diagram, wordId)];
    let catIndex = -1;
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (expandedFilter(element)) {
            return element;
        }
        const category = ElementCategory.getElementCategory(DiagramState.getItem(diagram, element).type);
        if (categoryFilter(category)) {
            catIndex = index;
        }
    }
    if (catIndex === -1) {
        throw "";
    }
    return elements[catIndex];
}

function getLabelData(diagram: DiagramState, { category, expanded }: DisplaySettings): LabelData[] {
    const expandedElements = expanded !== undefined
        ? getExpandedElements(diagram, expanded)
        : [];
    const expandedElementSet: Set<ElementId> = new Set(expandedElements);
    const expandedFilter: ExpandedFilter = (id) => expandedElementSet.has(id);
    const categoryFilter = ElementCategory.getLayerFilter(ElementCategory.getDefault(category));
    return diagram.lexemes.map((item) => {
        if (item.type === "whitespace") {
            const output: WhitespaceLexeme = {
                type: "whitespace",
                lexeme: item.lexeme
            };
            return output;
        }
        const lexeme = DiagramState.getTypedItem(diagram, "word", item.id).value.lexeme;
        const ancestorId = _getDisplayAncestor(diagram, item.id, expandedFilter, categoryFilter);
        const ancestorItem = DiagramState.getItem(diagram, ancestorId);
        const output: ElementLabelData = {
            type: "element",
            lexeme: lexeme,
            id: ancestorId,
            elementType: ancestorItem.type,
            referenced: ancestorItem.ref !== undefined
        };
        return output;
    });
}

function isElementLabel(label: LabelData): label is ElementLabelData {
    return label.type === "element";
}

export const Utils = {
    getLabelData: getLabelData,
    getAncestors: getAncestors,
    getChildren: getChildren,
    getExpandedElements: getExpandedElements,
    isElementLabel: isElementLabel
};