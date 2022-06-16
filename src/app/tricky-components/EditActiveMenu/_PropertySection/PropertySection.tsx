import { FadeTransport } from "@app/tricky-components/FadeTransport";
import { accessClassName, AnimationIdBuilderContext, AnimationIdBuilderUtils } from "@app/utils";
import React, { useContext } from "react";
import { EditActiveMenuDispatch, PropertyState } from "../types";
import { Property } from "../_Property";
import styles from "./_styles.module.scss";

export interface PropertySectionProps {
    type: "Assigned" | "Unassigned";
    children: PropertyState[];
    dispatch: EditActiveMenuDispatch;
}

export const PropertySection: React.VFC<PropertySectionProps> = ({ children, type, dispatch }) => {
    const { idBase } = useContext(AnimationIdBuilderContext);

    return (
        <div className={accessClassName(styles, "propertySection")}>
            <div className={accessClassName(styles, "header")}>
                <span>{type}</span>
                <div className={accessClassName(styles, "headerLine")} />
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
                    const animateId = AnimationIdBuilderUtils.extendId(idBase, prop.propertyKey);
                    return (
                        <FadeTransport key={prop.propertyKey} transportId={prop.propertyKey}>
                            <Property
                                onSelect={() => dispatch({
                                    type: "property select",
                                    property: prop.propertyKey
                                })}
                                onDelete={onCancel}
                                animateId={animateId}
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