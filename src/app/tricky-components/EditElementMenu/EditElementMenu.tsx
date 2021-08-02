import { accessClassName, DiagramState, DiagramStateContext, ElementDisplayInfo } from "@app/utils";
import { ElementId } from "@domain/language";
import React, { useContext } from "react";
import { ElementMenuContext } from "./element-menu-context";
import { MenuItem } from "./MenuItem";
import styles from "./_styles.scss";

export interface EditElementMenuProps {
    id: ElementId;
}

function getOrderedProperties(info: ElementDisplayInfo): string[] {
    const entries = Object.entries(info.properties);
    const output: string[] = [];
    for (let index = 0; index < entries.length; index++) {
        const [key, { displayOrder }] = entries[index];
        output[displayOrder] = key;
    }
    return output;
}

export const EditElementMenu: React.VFC<EditElementMenuProps> = ({ id }) => {
    const state = useContext(DiagramStateContext);
    const item = DiagramState.getItem(state.state.currState, id);
    const displayInfo = ElementDisplayInfo.getDisplayInfo(item.type);
    const properties = getOrderedProperties(displayInfo);
    const contextValue: ElementMenuContext = { id: id };
    return (
        <div className={accessClassName(styles, "editElementMenu")}>
            <div className={accessClassName(styles, "editElementMenuTitle")}>{displayInfo.fullName}</div>
            <div className={accessClassName(styles, "menuItemList")}>
                <ElementMenuContext.Provider value={contextValue}>
                    {properties.map((propertyName) => <MenuItem key={propertyName} propertyName={propertyName}/>)}
                </ElementMenuContext.Provider>
            </div>
        </div>
    );
};