import { DiagramState, ElementDisplayInfo, WordViewMode } from "@app/utils";
import { ElementCategory, ElementId, ElementRecord, ElementType } from "@domain/language";
import { ElementLexeme, Lexeme } from "../LabelView";
import { LabelSettings } from "../LabelView/LabelView";
import { DisplaySettings } from "./types";


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
        const category = ElementCategory.getElementCategory(DiagramState.getItem(diagram, element).type);
        if (!categoryFilter(category)) {
            break;
        }
        catIndex = index;
        if (expandedFilter(element)) {
            return element;
        }
    }
    if (catIndex === -1) {
        throw "";
    }
    return elements[catIndex];
}

function getLabelData(diagram: DiagramState, { category, expanded }: DisplaySettings): Lexeme[] {
    const expandedElements = expanded !== undefined
        ? getExpandedElements(diagram, expanded)
        : [];
    const expandedElementSet: Set<ElementId> = new Set(expandedElements);
    const expandedFilter: ExpandedFilter = (id) => expandedElementSet.has(id);
    const categoryFilter = ElementCategory.getLayerFilter(ElementCategory.getDefault(category));
    return diagram.lexemes.map((diagramLexeme) => {
        if (diagramLexeme.type === "whitespace") {
            return diagramLexeme;
        }
        const wordLexeme = DiagramState.getTypedItem(diagram, "word", diagramLexeme.id).value.lexeme;
        const ancestorId = _getDisplayAncestor(diagram, diagramLexeme.id, expandedFilter, categoryFilter);
        return {
            type: "element",
            id: ancestorId,
            lexeme: wordLexeme
        };
    });
}

export type LabelSettingsMode = {
    type: Extract<WordViewMode, "edit.active">;
    id: ElementId;
    property?: string;
} | {
    type: Exclude<WordViewMode, "edit.active">;
}

function _getPropertyHeader(keys: string | [string, string], info: ElementDisplayInfo): string {
    if (typeof keys === "string") {
        return ElementDisplayInfo.getAbbreviatedName(info.properties[keys]);
    } else if (Array.isArray(keys) && keys.length === 2) {
        const sortedKeys = [...keys].sort((a, b) => {
            const aVal = info.properties[a].displayOrder;
            const bVal = info.properties[b].displayOrder;
            return aVal - bVal;
        });
        const [key1, key2] = sortedKeys;
        const prop1 = ElementDisplayInfo.getAbbreviatedName(info.properties[key1]);
        const prop2 = ElementDisplayInfo.getAbbreviatedName(info.properties[key2]);
        return `${prop1} | ${prop2}`;
    }
    throw "unexpected data type";
}

function _isSelectedProperty(selectedProperty: string | undefined, properties: string | [string, string]): boolean {
    if (selectedProperty === undefined) {
        return false;
    }
    if (typeof properties === "string") {
        return properties === selectedProperty;
    } else {
        return properties.includes(selectedProperty);
    }
}

function getLabelSettings(mode: LabelSettingsMode, diagram: DiagramState, lexemes: Lexeme[]): Record<ElementId, LabelSettings> {
    const output: Record<ElementId, LabelSettings> = {};
    if (mode.type === "edit.active") {
        const parent = DiagramState.getItem(diagram, mode.id);
        if (parent.type === "word") {
            throw "hi";
        }
        const parentInfo = ElementDisplayInfo.getDisplayInfo(parent.type);
        for (let index = 0; index < lexemes.length; index++) {
            const lexeme = lexemes[index];
            if (!Utils.isElementLabel(lexeme)) {
                continue;
            }
            const { id } = lexeme;
            if (id in output) {
                continue;
            }
            const properties = DiagramState.getReferencingProperties(
                parent.type as Exclude<ElementType, "word">,
                parent.value,
                id
            );
            if (properties === undefined) {
                continue;
            }
            const elementType = DiagramState.getItem(diagram, id).type;
            const header = _getPropertyHeader(properties, parentInfo);
            output[id] = {
                fade: _isSelectedProperty(mode.property, properties),
                header: header,
                color: ElementDisplayInfo.getDisplayInfo(elementType).color
            };
        }
    } else {
        for (let index = 0; index < lexemes.length; index++) {
            const lexeme = lexemes[index];
            if (!Utils.isElementLabel(lexeme)) {
                continue;
            }
            const { id } = lexeme;
            if (id in output) {
                continue;
            }
            const item = DiagramState.getItem(diagram, id);
            const itemInfo = ElementDisplayInfo.getDisplayInfo(item.type);
            const header = !!item.ref ? `🔗 ${itemInfo.header}` : itemInfo.header;
            output[id] = {
                color: itemInfo.color,
                header
            };
        }
    }
    return output;
}

function isElementLabel(label: Lexeme): label is ElementLexeme {
    return label.type === "element";
}

export const Utils = {
    getLabelData: getLabelData,
    getAncestors: getAncestors,
    getChildren: getChildren,
    getExpandedElements: getExpandedElements,
    isElementLabel: isElementLabel,
    getLabelSettings: getLabelSettings
};