import { DiagramState, ElementDisplayInfo, LabelFormMode } from "@app/utils";
import { ElementCategory, ElementId, ElementRecord, ElementType, getElementDefinition } from "@domain/language";
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

export type LabelSettingsMode = EditActiveLabelSettingsMode | {
    type: Exclude<LabelFormMode, "edit.active">;
}

interface EditActiveLabelSettingsMode {
    type: Extract<LabelFormMode, "edit.active">;
    id: ElementId;
    property?: string;
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

function _getEditActiveLabelSettings(mode: EditActiveLabelSettingsMode, diagram: DiagramState, lexemes: Lexeme[]): Record<ElementId, LabelSettings> {
    const output: Record<ElementId, LabelSettings> = {};
    const parent = DiagramState.getItem(diagram, mode.id);
    if (parent.type === "word") {
        throw `element '${mode.id}' is a word. words cannot be edited`;
    }
    const parentInfo = ElementDisplayInfo.getDisplayInfo(parent.type);
    if (mode.property === undefined) {
        // display mode
        lexemes.filter(Utils.isElementLabel).forEach((element) => {
            const item = DiagramState.getItem(diagram, element.id);
            if (item.ref === mode.id) {
                const keys = DiagramState.getReferencingProperties(
                    parent.type as Exclude<ElementType, "word">,
                    parent.value,
                    element.id
                );
                if (keys === undefined) {
                    throw `element '${element.id}' claims to reference '${mode.id}' but is not in the properties of '${mode.id}'`;
                }
                const header = _getPropertyHeader(keys, parentInfo);
                const itemInfo = ElementDisplayInfo.getDisplayInfo(item.type);
                output[element.id] = {
                    header: header,
                    color: itemInfo.color
                };
            }
        });
    } else {
        // edit property mode
        const parentDef = getElementDefinition(parent.type);
        if (!(mode.property in parentDef)) {
            throw `no property definition for '${mode.property}' in '${parent.type}' element`;
        }
        const children = DiagramState.getElementReferences(parent.type, parent.value);
        const childrenIds: ElementId[] = mode.property in children
            ? children[mode.property].map((child) => child.id)
            : [];
        const childrenIdSet = new Set(childrenIds);
        const [, validPropTypes] = parentDef[mode.property];
        const validPropTypeSet = new Set(validPropTypes);
        lexemes.filter(Utils.isElementLabel).forEach((element) => {
            const item = DiagramState.getItem(diagram, element.id);
            const itemInfo = ElementDisplayInfo.getDisplayInfo(item.type);
            if (childrenIdSet.has(element.id)) {
                const keys = DiagramState.getReferencingProperties(
                    parent.type as Exclude<ElementType, "word">,
                    parent.value,
                    element.id
                );
                if (keys === undefined) {
                    throw `element '${element.id}' claims to reference '${mode.id}' but is not in the properties of '${mode.id}'`;
                }
                output[element.id] = {
                    color: itemInfo.color,
                    header: _getPropertyHeader(keys, parentInfo)
                };
            } else if (item.ref === undefined && validPropTypeSet.has(item.type)) {
                output[element.id] = {
                    fade: true,
                    color: itemInfo.color,
                    header: itemInfo.header
                };
            }
        });
    }
    return output;
}

function _getEditBrowseSettings(diagram: DiagramState, lexemes: ElementLexeme[]): Record<ElementId, LabelSettings> {
    const output: Record<ElementId, LabelSettings> = {};
    for (let index = 0; index < lexemes.length; index++) {
        const { id } = lexemes[index];
        const { type } = DiagramState.getItem(diagram, id);
        if (type === "word") {
            continue;
        }
        output[id] = getGeneralLabelSettings(diagram, id);
    }
    return output;
}

function _getDeleteSettings(diagram: DiagramState, lexemes: ElementLexeme[]): Record<ElementId, LabelSettings> {
    const output: Record<ElementId, LabelSettings> = {};
    for (let index = 0; index < lexemes.length; index++) {
        const { id } = lexemes[index];
        const { type } = DiagramState.getItem(diagram, id);
        if (type === "word") {
            continue;
        }
        output[id] = getGeneralLabelSettings(diagram, id);
    }
    return output;
}

function getLabelSettings(mode: LabelSettingsMode, diagram: DiagramState, lexemes: ElementLexeme[]): Record<ElementId, LabelSettings> {
    switch (mode.type) {
        case "edit.active":
            return _getEditActiveLabelSettings(mode, diagram, lexemes);
        case "edit.browse":
            return _getEditBrowseSettings(diagram, lexemes);
        case "delete":
            return _getDeleteSettings(diagram, lexemes);
    }
    const output: Record<ElementId, LabelSettings> = {};
    for (let index = 0; index < lexemes.length; index++) {
        const lexeme = lexemes[index];
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
    return output;
}

function getGeneralLabelSettings(diagram: DiagramState, id: ElementId): LabelSettings {
    const { type, ref } = DiagramState.getItem(diagram, id);
    const itemInfo = ElementDisplayInfo.getDisplayInfo(type);
    const header = !!ref ? `🔗 ${itemInfo.header}` : itemInfo.header;
    return {
        color: itemInfo.color,
        header
    };
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