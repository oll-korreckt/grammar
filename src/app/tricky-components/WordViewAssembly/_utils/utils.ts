import { PropertyEditorDisplayState, PropertyEditorEditState } from "@app/tricky-components/PropertyEditor/PropertyEditor";
import { PropertyEditorAction, PropertyState } from "@app/tricky-components/PropertyEditor/types";
import { DiagramState, DiagramStateItem, ElementDisplayInfo } from "@app/utils";
import { ElementId, ElementReference, ElementType, getElementDefinition } from "@domain/language";
import { Action } from "./types";

function isOccupied(propValue: ElementReference | ElementReference[] | undefined): boolean {
    return propValue !== undefined && !Array.isArray(propValue);
}

function getAddProperties(childType: ElementType, item: DiagramStateItem): string[] {
    if (item.type === "word") {
        return [];
    }
    const value = item.value as unknown as Record<string, ElementReference | ElementReference[]>;
    const info = getElementDefinition(item.type);
    const entries = Object.entries(info);
    const output: string[] = [];
    for (let index = 0; index < entries.length; index++) {
        const [key, [, validTypes]] = entries[index];
        const propValue = value[key];
        if (isOccupied(propValue)) {
            continue;
        }
        if (validTypes.includes(childType)) {
            output.push(key);
        }
    }
    return output;
}

function mapPropertyEditorDispatch(dispatch: React.Dispatch<Action>): React.Dispatch<PropertyEditorAction> {
    return (action) => {
        switch (action.type) {
            case "property select":
                dispatch({
                    type: "edit.active: Select property",
                    property: action.property
                });
                break;
            case "property delete":
                dispatch({
                    type: "edit.active: Delete property",
                    property: action.property
                });
                break;
            case "exit edit":
                dispatch({
                    type: "edit.active: Select property",
                    property: undefined
                });
                break;
            case "submit":
                dispatch({ type: "edit.active: Done" });
                break;
            case "close":
                dispatch({ type: "edit.active: Cancel" });
                break;
            default:
                throw "undefined action";
        }
    };
}

function getPropertyState(diagramState: DiagramState, id: ElementId, property: string): PropertyState {
    const { type, value } = DiagramState.getItem(diagramState, id);
    const propInfo = ElementDisplayInfo.getDisplayInfo(type).properties[property];
    const propValue = (value as any)[property];
    return {
        propertyKey: property,
        displayName: ElementDisplayInfo.getAbbreviatedName(propInfo),
        order: propInfo.displayOrder,
        required: propInfo.required,
        satisfied: propValue !== undefined
    };
}

function elementComplete({ type, value }: DiagramStateItem): boolean {
    const propInfos = Object.entries(ElementDisplayInfo.getDisplayInfo(type).properties);
    for (let index = 0; index < propInfos.length; index++) {
        const [key, { required }] = propInfos[index];
        if (required && (value as any)[key] === undefined) {
            return false;
        }
    }
    return true;
}

function getEditState(diagramState: DiagramState, id: ElementId, property: string): PropertyEditorEditState {
    return {
        type: "edit",
        allowSubmit: elementComplete(DiagramState.getItem(diagramState, id)),
        property: getPropertyState(diagramState, id, property)
    };
}

function getDisplayState(diagramState: DiagramState, id: ElementId): PropertyEditorDisplayState {
    const item = DiagramState.getItem(diagramState, id);
    const { type } = item;
    const propInfos = ElementDisplayInfo.getDisplayInfo(type).properties;
    const output: PropertyEditorDisplayState = {
        type: "display",
        allowSubmit: true,
        assigned: [],
        unassigned: []
    };
    const entries = Object.entries(propInfos)
        .sort(([, a], [, b]) => a.displayOrder - b.displayOrder);
    for (let index = 0; index < entries.length; index++) {
        const [key] = entries[index];
        const prop = getPropertyState(diagramState, id, key);
        if (output.allowSubmit && prop.required && !prop.satisfied) {
            output.allowSubmit = false;
        }
        if (prop.satisfied) {
            output.assigned.push(prop);
        } else {
            output.unassigned.push(prop);
        }
    }
    return output;
}

export const utils = {
    isOccupied: isOccupied,
    getAddProperties: getAddProperties,
    mapPropertyEditorDispatch: mapPropertyEditorDispatch,
    getPropertyState: getPropertyState,
    getEditState: getEditState,
    getDisplayState: getDisplayState
};