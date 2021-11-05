import { accessClassName } from "@app/utils";
import React from "react";
import { ActionDispatch, PropertyData } from "../types";
import { Property } from "../_Property/Property";
import styles from "./_styles.scss";

export interface PropertySectionProps {
    children: "Assigned" | "Unassigned";
    properties: PropertyData[];
    onAction: ActionDispatch;
}

export const PropertySection: React.VFC<PropertySectionProps> = ({ children, properties, onAction }) => {

    return (
        <div className={accessClassName(styles, "container")}>
            <div>
                {children}
            </div>
            <div className={accessClassName(styles, "items")}>
                {properties.map(({ key, fullName }) => {
                    let onCancel: (() => void) | undefined = undefined;
                    if (children === "Assigned") {
                        onCancel = () => onAction({
                            type: "property cancel",
                            property: key
                        });
                    }
                    return (
                        <Property
                            key={key}
                            propertyKey={key}
                            onClick={() => onAction({
                                type: "property edit",
                                property: key
                            })}
                            onCancel={onCancel}
                        >
                            {fullName}
                        </Property>
                    );
                })}
            </div>
        </div>
    );
};