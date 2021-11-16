import { FadeTransport } from "@app/tricky-components/FadeTransport";
import { accessClassName } from "@app/utils";
import React from "react";
import { ActionDispatch, PropertyState } from "../types";
import { Property } from "../_Property/Property";
import styles from "./_styles.scss";

export interface PropertySectionProps {
    type: "Assigned" | "Unassigned";
    children: PropertyState[];
    dispatch: ActionDispatch;
}

export const PropertySection: React.VFC<PropertySectionProps> = ({ children, type, dispatch }) => {

    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "header")}>
                <span>{type}</span>
                <div className={accessClassName(styles, "headerLine")}/>
            </div>
            <div className={accessClassName(styles, "items")}>
                {children.map((prop) => {
                    let onCancel: (() => void) | undefined = undefined;
                    if (type === "Assigned") {
                        onCancel = () => dispatch({
                            type: "property cancel",
                            property: prop
                        });
                    }
                    const displayText = prop.displayName !== undefined
                        ? prop.displayName
                        : prop.propertyKey;
                    console.log("display:", prop.propertyKey);
                    return (
                        <FadeTransport key={prop.propertyKey} transportId={prop.propertyKey}>
                            <Property
                                onSelect={() => dispatch({
                                    type: "property select",
                                    property: prop
                                })}
                                onCancel={onCancel}
                            >
                                {displayText}
                            </Property>
                        </FadeTransport>
                    );
                })}
            </div>
        </div>
    );
};