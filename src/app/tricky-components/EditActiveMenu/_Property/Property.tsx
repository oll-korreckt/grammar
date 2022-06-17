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
    type BackgroundClass = "satisfied" | "required" | "default"
    let backgroundClass: BackgroundClass;
    if (satisfied) {
        backgroundClass = "satisfied";
    } else if (required) {
        backgroundClass = "required";
    } else {
        backgroundClass = "default";
    }
    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);
    bodyClasses.push(isAnimating ? backgroundClass + "Animate" : backgroundClass);

    const textClasses = ["propertyText"];
    if (hasSelect) {
        textClasses.push("hasSelect");
    }
    if (hasDelete) {
        textClasses.push("withDelete");
    } else {
        textClasses.push("noDelete");
    }

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