import { FadeTransport } from "@app/tricky-components/FadeTransport";
import { accessClassName } from "@app/utils";
import React from "react";
import { EditActiveMenuDispatch, PropertyState } from "../types";
import { Property } from "../_Property";
import styles from "./_styles.scss";

export interface PropertySectionProps {
    type: "Assigned" | "Unassigned";
    children: PropertyState[];
    dispatch: EditActiveMenuDispatch;
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
                            type: "property delete",
                            property: prop.propertyKey
                        });
                    }
                    const displayText = prop.displayName !== undefined
                        ? prop.displayName
                        : prop.propertyKey;
                    return (
                        <FadeTransport key={prop.propertyKey} transportId={prop.propertyKey}>
                            <Property
                                onSelect={() => dispatch({
                                    type: "property select",
                                    property: prop.propertyKey
                                })}
                                onDelete={onCancel}
                                satisfied={prop.satisfied}
                                required={prop.required}
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