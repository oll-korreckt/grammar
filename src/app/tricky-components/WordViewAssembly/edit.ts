import { DiagramState, DiagramStateItem, ElementData, ElementDisplayInfo, ReferenceObject } from "@app/utils";
import { withEventListener } from "@app/utils/hoc";
import { ElementId, ElementReference, ElementType, getElementDefinition } from "@domain/language";
import { Dispatch } from "react";
import { BuildFunction } from "../WordView/WordView";
import { Action, EditState } from "./types";
import { withPropertyHeader } from "./high-order-component";
import { withDisable, withFade } from "@app/basic-components/Word";

type PropertyIdentifier = (id: ElementId) => undefined | string;

function createPropertyIdentifier(type: ElementType, refObj: ReferenceObject): PropertyIdentifier {
    const displayInfo = ElementDisplayInfo.getDisplayInfo(type);
    const outputObj: Record<string, string> = {};
    Object.entries(refObj).forEach(([property, references]) => {
        const propAbr = ElementDisplayInfo.getAbbreviatedName(displayInfo.properties[property]);
        references.forEach(({ id }) => {
            if (outputObj[id] === undefined) {
                outputObj[id] = propAbr;
            } else {
                outputObj[id] += ` ${propAbr}`;
            }
        });
    });
    return (id) => outputObj[id] as undefined | string;
}

type PropertyChecker = (data: ElementData) => "assigned" | "validType" | "ignore";

function createPropertyChecker({ value, type }: DiagramStateItem, property: string): PropertyChecker {
    const propIds: ElementId[] = [];
    const propValue = (value as unknown as Record<string, ElementReference | ElementReference[]>)[property];
    if (propValue !== undefined) {
        if (Array.isArray(propValue)) {
            propValue.forEach(({ id }) => propIds.push(id));
        } else {
            propIds.push(propValue.id);
        }
    }
    const idSet = new Set(propIds);
    const parentDef = getElementDefinition(type as Exclude<ElementType, "word">);
    const [, propTypes] = parentDef[property];
    const propTypeSet = new Set(propTypes);
    return (data) => {
        if (idSet.has(data.id)) {
            return "assigned";
        } else if (propTypeSet.has(data.type)) {
            return "validType";
        } else {
            return "ignore";
        }
    };
}

export function getEditBuildFn(state: EditState, dispatch: Dispatch<Action>): BuildFunction {
    const { diagramStateContext, id, property } = state;
    const parentItem = DiagramState.getItem(diagramStateContext.state, id);
    if (parentItem.type === "word") {
        throw "cannot reference word";
    }
    const parentReferences = DiagramState.getElementReferences(parentItem.type, parentItem.value);
    let buildFn: BuildFunction;
    if (property === undefined) {
        const propertyIdentifier = createPropertyIdentifier(parentItem.type, parentReferences);
        buildFn = (Component, data) => {
            const refProperties = propertyIdentifier(data.id);
            return refProperties === undefined
                ? withDisable(Component)
                : withPropertyHeader(Component, refProperties);
        };
    } else {
        const propertyChecker = createPropertyChecker(parentItem, property);
        buildFn = (Component, data) => {
            let output = Component;
            const result = propertyChecker(data);
            switch (result) {
                case "assigned":
                    output = withEventListener(output, "click", () => dispatch({
                        type: "edit: Remove child reference",
                        property: property,
                        childId: data.id
                    }));
                    break;
                case "validType":
                    output = withFade(output);
                    output = withEventListener(output, "click", () => dispatch({
                        type: "edit: Add child reference",
                        property: property,
                        childId: data.id
                    }));
                    break;
                case "ignore":
                    output = withDisable(output);
                    break;
                default:
                    throw `unexpected state ${result}`;
            }
            return output;
        };
    }
    return buildFn;
}