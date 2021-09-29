import { withDisable, withFade } from "@app/basic-components/Word";
import { BuildFunction, WordView } from "@app/tricky-components";
import { PropertySelector } from "@app/tricky-components/PropertySelector";
import { DiagramState, DiagramStateItem, ElementData, ElementDisplayInfo, ReferenceObject } from "@app/utils";
import { withEventListener } from "@app/utils/hoc";
import { ElementId, ElementReference, ElementType, getElementDefinition } from "@domain/language";
import React from "react";
import { withPropertyHeader } from "../_utils/high-order-component";
import { Action, EditActiveState } from "../_utils/types";

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

export function createBuildFn(state: EditActiveState, dispatch: React.Dispatch<Action>): BuildFunction {
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
            console.log(result, data.id);
            switch (result) {
                case "assigned":
                    output = withEventListener(output, "click", () => dispatch({
                        type: "edit.active: Remove child reference",
                        property: property,
                        childId: data.id
                    }));
                    break;
                case "validType":
                    output = withFade(output);
                    output = withEventListener(output, "click", () => dispatch({
                        type: "edit.active: Add child reference",
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

export interface EditBodyProps {
    state: EditActiveState;
    dispatch: React.Dispatch<Action>;
}

export const EditActiveBody: React.VFC<EditBodyProps> = ({ state, dispatch }) => {
    const buildFn = createBuildFn(state, dispatch);
    const item = DiagramState.getItem(
        state.diagramStateContext.state,
        state.id
    );
    return (
        <>
            <WordView buildFn={buildFn}/>
            <PropertySelector
                item={item}
                selectedProperty={state.property}
                onSelectChange={(property) => dispatch({ type: "edit.active: Select property", property: property })}
            />
        </>
    );
};