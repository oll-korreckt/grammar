import { ButtonBar, ButtonBarProps } from "@app/basic-components";
import { withDisable, withFade } from "@app/basic-components/Word";
import { accessClassName, DiagramState, DiagramStateItem, ElementData } from "@app/utils";
import { makeRefComponent, RefComponent, withClassName, withEventListener } from "@app/utils/hoc";
import { ElementId, ElementReference, ElementType, getElementDefinition } from "@domain/language";
import React from "react";
import { BuildFunction } from "..";
import { Action, AddToParent, AddToState } from "./types";
import styles from "./_styles.scss";

type ItemIdentifier = (data: ElementData) =>
    | ["child"]
    | ["canAdd", string[]]
    | ["ignore"]
    | ["parent"];

function isOccupied(propValue: ElementReference | ElementReference[] | undefined): boolean {
    return propValue !== undefined && !Array.isArray(propValue);
}

function getAddProperties(childType: ElementType, item: DiagramStateItem): string[] {
    const value = item.value as unknown as Record<string, ElementReference | ElementReference[]>;
    const info = getElementDefinition(item.type as Exclude<ElementType, "word">);
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

function createItemIdentifier(state: DiagramState, childId: ElementId, parent: AddToParent | undefined): ItemIdentifier {
    const childItem = DiagramState.getItem(state, childId);
    const parentItem = parent === undefined
        ? undefined
        : DiagramState.getItem(state, parent.id);
    return (data) => {
        if (data.id === childId) {
            return ["child"];
        }
        if (parentItem === undefined) {
            const dataItem = DiagramState.getItem(state, data.id);
            const addProperties = getAddProperties(childItem.type, dataItem);
            if (addProperties.length > 0) {
                return ["canAdd", addProperties];
            }
        } else {
            if (parent === undefined) {
                throw "unhandled state";
            }
            if (data.id === parent.id) {
                return ["parent"];
            }
        }
        return ["ignore"];
    };
}

function withOutline(Component: RefComponent<HTMLSpanElement>): RefComponent<HTMLSpanElement> {
    return makeRefComponent<HTMLSpanElement>("withOutline", (_, ref) => {
        return (
            <span className={accessClassName(styles, "outline")}>
                <Component ref={ref}/>
            </span>
        );
    });
}

export function getAddToBuildFunction({ diagramStateContext, childId, parent }: AddToState, dispatch: React.Dispatch<Action>): BuildFunction {
    const identifier = createItemIdentifier(
        diagramStateContext.state,
        childId,
        parent
    );
    return (Component, data) => {
        const [idType, idData] = identifier(data);
        let output = Component;
        switch (idType) {
            case "child":
                output = withOutline(output);
                break;
            case "canAdd":
                output = withFade(output);
                const castIdData = idData as string[];
                const property = castIdData.length === 1
                    ? castIdData[0]
                    : castIdData;
                output = withEventListener(output, "click", () => dispatch({
                    type: "add to: Set Parent",
                    parent: {
                        id: data.id,
                        type: data.type as Exclude<ElementType, "word">,
                        property: property
                    }
                }));
                break;
            case "parent":
                output = withEventListener(output, "click", () => dispatch({
                    type: "add to: Set Parent",
                    parent: undefined
                }));
                break;
            case "ignore":
                output = withDisable(output);
                break;
            default:
                throw `unhandled state '${idType}'`;
        }
        return output;
    };
}

export interface AddToButtonBarProps {
    state: AddToState;
    dispatch: React.Dispatch<Action>;
}

type ButtonBarItems = ["Done", "Cancel"];

function createButtonBarBuildFn(state: AddToState, dispatch: React.Dispatch<Action>): Exclude<ButtonBarProps["buildFn"], undefined> {
    return (Component, item) => {
        let output = Component;
        const castItem = item as ButtonBarItems[number];
        switch (castItem) {
            case "Done":
                if (state.parent === undefined) {
                    output = withClassName(
                        output,
                        accessClassName(styles, "disableDone")
                    );
                } else {
                    output = withEventListener(output, "click", () => dispatch({
                        type: "add to: Done"
                    }));
                }
                break;
            case "Cancel":
                output = withEventListener(output, "click", () => dispatch({
                    type: "derive: Cancel"
                }));
                break;
            default:
                throw `unhandled button '${castItem}'`;
        }
        return output;
    };
}

export const AddToButtonBar: React.VFC<AddToButtonBarProps> = ({ state, dispatch }) => {
    const buildFn = createButtonBarBuildFn(state, dispatch);
    return (
        <ButtonBar buildFn={buildFn}>
            {["Done", "Cancel"] as ButtonBarItems}
        </ButtonBar>
    );
};