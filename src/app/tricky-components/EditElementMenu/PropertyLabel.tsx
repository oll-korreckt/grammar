import { accessClassName, appendClassName } from "@app/utils";
import React, { useContext } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { MenuItemContext } from "./menu-item-context";
import styles from "./_styles.scss";

export interface PropertyLabelProps {
    children: string;
}

export const PropertyLabel: React.VFC<PropertyLabelProps> = ({ children }) => {
    const menuItemContext = useContext(MenuItemContext);
    const canAdd = menuItemContext.isArray ? true : menuItemContext.reference === undefined;
    let className = accessClassName(styles, "propertyLabel");
    if (menuItemContext.required && menuItemContext.reference === undefined) {
        className = appendClassName(className, styles, "redText");
    }

    return (
        <div className={className}>
            <div className={accessClassName(styles, "propertyLabelText")}>{children}</div>
            <div className={accessClassName(styles, "propertyLabelAdd")}>{canAdd && <FaPlusCircle/>}</div>
        </div>
    );
};