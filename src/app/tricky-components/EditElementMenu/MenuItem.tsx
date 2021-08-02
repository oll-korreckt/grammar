import React from "react";
import { ElementId, ElementReference, getElementDefinition } from "@domain/language";
import { useContext } from "react";
import { accessClassName, DiagramState, DiagramStateContext, ElementDisplayInfo, HistoryState } from "@app/utils";
import { PropertyLabel } from "./PropertyLabel";
import { ElementMenuContext } from "./element-menu-context";
import { MenuItemContext } from "./menu-item-context";
import { PropertyValues } from "./PropertyValues";
import styles from "./_styles.scss";

export interface MenuItemProps {
    propertyName: string;
}

function deleteReference(id: ElementId, currValue: undefined | ElementReference | ElementReference[]): undefined | ElementReference | ElementReference[] {
    const emptyErr = "Cannot delete empty property";
    if (currValue === undefined) {
        throw emptyErr;
    }
    const notFoundErr = `Property value does not contain a reference to '${id}' element`;
    if (Array.isArray(currValue)) {
        if (currValue.length === 0) {
            throw emptyErr;
        }
        const output = currValue.filter((x) => x.id === id);
        if (output.length !== currValue.length - 1) {
            throw notFoundErr;
        }
        return output.length === 0 ? undefined : output;
    } else {
        if (currValue.id !== id) {
            throw notFoundErr;
        }
        return undefined;
    }
}

export const MenuItem: React.VFC<MenuItemProps> = ({ propertyName }) => {
    const state = useContext(DiagramStateContext);
    const { id } = useContext(ElementMenuContext);
    const item = DiagramState.getItem(state.state.currState, id);
    const itemType = item.type;
    if (itemType === "word") {
        throw "Cannot display";
    }
    const [isArray, elementTypes] = getElementDefinition(itemType)[propertyName];
    const propertyValue = (item.value as unknown as Record<string, undefined | ElementReference | ElementReference[]>)[propertyName];
    const displayInfo = ElementDisplayInfo.getDisplayInfo(item.type).properties[propertyName];
    const required = displayInfo.required === undefined ? false : displayInfo.required;
    const propertyLabel = displayInfo.fullName;
    const contextValue: MenuItemContext = {
        id: id,
        propertyLabel: propertyLabel,
        elementTypes: elementTypes,
        required: required,
        isArray: isArray,
        reference: propertyValue,
        deleteReference: (delId) => {
            const newValue = deleteReference(delId, propertyValue);
            const change = DiagramState.setReference(state.state.currState, itemType, id, propertyName, newValue);
            const newState = HistoryState.stageChange(state.state, ...change);
            state.setState(newState);
        }
    };

    return (
        <div className={accessClassName(styles, "menuItem")}>
            <MenuItemContext.Provider value={contextValue}>
                <PropertyLabel>{propertyLabel}</PropertyLabel>
                <PropertyValues/>
            </MenuItemContext.Provider>
        </div>
    );
};