import { accessClassName, ClickListenerContext, ControlAnimationContext, ControlAnimationUtils } from "@app/utils";
import React, { useContext } from "react";
import { FaTimes } from "react-icons/fa";
import { PropertyState } from "../types";
import styles from "./_styles.module.scss";

type PropertyClick = () => void;

export interface PropertyProps extends Pick<PropertyState, "required" | "satisfied"> {
    onSelect?: PropertyClick;
    onDelete?: PropertyClick;
    children: string;
    required?: boolean | undefined;
    satisfied?: boolean | undefined;
    animateId?: string;
}

export const Property: React.VFC<PropertyProps> = ({ onSelect, onDelete, children, required, satisfied, animateId }) => {
    const { onElementClick } = useContext(ClickListenerContext);
    const { activeElement } = useContext(ControlAnimationContext);
    const hasSelect = onSelect !== undefined;
    const hasDelete = onDelete !== undefined;

    const bodyClasses = ["property"];
    if (satisfied) {
        bodyClasses.push("satisfied");
    } else if (required) {
        bodyClasses.push("required");
    } else {
        bodyClasses.push("default");
    }

    const textClasses = ["propertyText"];
    if (hasSelect) {
        textClasses.push("hasSelect");
    }
    if (hasDelete) {
        textClasses.push("withDelete");
    } else {
        textClasses.push("noDelete");
    }

    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);

    return (
        <div
            className={accessClassName(styles, ...bodyClasses)}
        >
            <div
                className={accessClassName(styles, ...textClasses)}
                onClick={() => {
                    onElementClick && onElementClick(animateId);
                    onSelect && onSelect();
                }}
            >
                {children}
            </div>
            {hasDelete &&
                <div
                    id={animateId}
                    className={accessClassName(styles, "propertyDelete")}
                    onClick={() => onDelete && onDelete()}
                >
                    <FaTimes className={accessClassName(styles, "faTimes")} />
                </div>
            }
        </div>
    );
};