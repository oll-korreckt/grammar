import { accessClassName } from "@app/utils";
import React from "react";
import { FaTimes } from "react-icons/fa";
import { PropertyState } from "../types";
import styles from "./_styles.scss";

type PropertyClick = () => void;

export interface PropertyProps extends Pick<PropertyState, "required" | "satisfied"> {
    onSelect?: PropertyClick;
    onCancel?: PropertyClick;
    children: string;
}

export const Property: React.VFC<PropertyProps> = ({ onSelect, onCancel, children }) => {
    const hasCancel = onCancel !== undefined;

    const textClasses = ["propertyText"];
    if (hasCancel) {
        textClasses.push("withCancel");
    } else {
        textClasses.push("noCancel");
    }

    return (
        <div
            className={accessClassName(styles, "property")}
        >
            <div
                className={accessClassName(styles, ...textClasses)}
                onClick={() => onSelect && onSelect()}
            >
                {children}
            </div>
            {hasCancel &&
                <div
                    className={accessClassName(styles, "propertyCancel")}
                    onClick={() => onCancel && onCancel()}
                >
                    <FaTimes className={accessClassName(styles, "faTimes")} />
                </div>
            }
        </div>
    );
};