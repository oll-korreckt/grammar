import { accessClassName } from "@app/utils";
import React from "react";
import { FaTimes } from "react-icons/fa";
import { PropertyState } from "../types";
import styles from "./_styles.modules.scss";

type PropertyClick = () => void;

export interface PropertyProps extends Pick<PropertyState, "required" | "satisfied"> {
    onSelect?: PropertyClick;
    onDelete?: PropertyClick;
    children: string;
    required?: boolean | undefined;
    satisfied?: boolean | undefined;
}

export const Property: React.VFC<PropertyProps> = ({ onSelect, onDelete, children, required, satisfied }) => {
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

    return (
        <div
            className={accessClassName(styles, ...bodyClasses)}
        >
            <div
                className={accessClassName(styles, ...textClasses)}
                onClick={() => onSelect && onSelect()}
            >
                {children}
            </div>
            {hasDelete &&
                <div
                    className={accessClassName(styles, "propertyDelete")}
                    onClick={() => onDelete && onDelete()}
                >
                    <FaTimes className={accessClassName(styles, "faTimes")} />
                </div>
            }
        </div>
    );
};