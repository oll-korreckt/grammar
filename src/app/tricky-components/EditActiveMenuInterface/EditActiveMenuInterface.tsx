import { ElementDisplayInfo } from "@app/utils";
import { Element, ElementType, Noun } from "@domain/language";
import { ElementRecord, ElementReference } from "@domain/language/_types/utils";
import React from "react";
import { EditActiveMenu, EditActiveMenuDispatch, EditActiveMenuDisplayState, EditActiveMenuEditState, EditActiveMenuState, PropertyState } from "../EditActiveMenu";

export interface EditActiveMenuInterfaceProps {
    type?: Exclude<ElementType, "word">;
    value?: Element;
    property?: string;
    dispatch?: EditActiveMenuDispatch;
}

function convertState(type: Exclude<ElementType, "word">, value: Element, property: string | undefined): EditActiveMenuState {
    const output = property === undefined
        ? initDisplayState(type, value)
        : initEditState(type, value, property);
    output.allowSubmit = getAllowSubmit(type, value);
    return output;
}

function getAllowSubmit(type: Exclude<ElementType, "word">, value: Element): boolean {
    const properties = Object.entries(ElementDisplayInfo.getDisplayInfo(type).properties);
    for (let index = 0; index < properties.length; index++) {
        const [property, propInfo] = properties[index];
        const propValue = (value as unknown as ElementRecord)[property];
        if (propInfo.required && propValue === undefined) {
            return false;
        }
    }
    return true;
}

function initDisplayState(type: Exclude<ElementType, "word">, value: Element): EditActiveMenuDisplayState {
    const displayInfo = ElementDisplayInfo.getDisplayInfo(type);
    const assigned: PropertyState[] = [];
    const unassigned: PropertyState[] = [];
    Object.entries(displayInfo.properties).forEach(([key, propInfo]) => {
        const propValue = (value as unknown as ElementRecord)[key];
        if (!isPropertyValue(propValue)) {
            throw `property '${key}' is not a valid type`;
        }
        const propState = createPropertyState(key, propInfo, propValue);
        if (propState.satisfied) {
            assigned.push(propState);
        } else {
            unassigned.push(propState);
        }
    });
    return {
        type: "display",
        assigned,
        unassigned
    };
}

function initEditState(type: Exclude<ElementType, "word">, value: Element, property: string): EditActiveMenuEditState {
    const displayInfo = ElementDisplayInfo.getDisplayInfo(type);
    const propInfo = displayInfo.properties[property];
    if (propInfo === undefined) {
        throw `property '${property}' does not exist in type '${type}'`;
    }
    const propValue = (value as unknown as ElementRecord)[property];
    if (!isPropertyValue(propValue)) {
        throw `property '${property}' is not a valid type`;
    }
    const propState = createPropertyState(property, propInfo, propValue);
    return {
        type: "edit",
        property: propState
    };
}

function createPropertyState(propertyKey: string, propInfo: ElementDisplayInfo["properties"][string], propValue: undefined | ElementReference | ElementReference[]): PropertyState {
    return {
        propertyKey: propertyKey,
        order: propInfo.displayOrder,
        displayName: ElementDisplayInfo.getAbbreviatedName(propInfo),
        required: !!propInfo.required,
        satisfied: propValue !== undefined
    };
}

function isPropertyValue(value: undefined | string | ElementReference | ElementReference[]): value is undefined | ElementReference | ElementReference[] {
    return typeof value !== "string";
}

const blankNoun: Noun = {
    id: "",
    posType: "noun"
};

export const EditActiveMenuInterface: React.VFC<EditActiveMenuInterfaceProps> = ({ type, value, property, dispatch }) => {
    const definedType: Exclude<ElementType, "word"> = type !== undefined ? type : "noun";
    const definedValue: Element = value !== undefined ? value : blankNoun;
    const menuState = convertState(definedType, definedValue, property);

    return (
        <EditActiveMenu
            state={menuState}
            elementType={type}
            dispatch={dispatch}
        />
    );
};