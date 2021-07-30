import React from "react";
import { makeRefComponent } from "@app/utils/hoc";
import styles from "./_styles.scss";
import { accessClassName, Colors } from "@app/utils";
import { FaTimesCircle } from "react-icons/fa";

export interface PropertyValueItemProps {
    type: string;
    color: Colors;
    children: string;
}

export const PropertyValueItem = makeRefComponent<HTMLDivElement, PropertyValueItemProps>("PropertyValueItem", ({ children, color, type }, ref) => {
    return (
        <div ref={ref} className={accessClassName(styles, color, "item")}>
            <div className={accessClassName(styles, "head", `${color}Dark`)}>
                {type}
            </div>
            <div className={accessClassName(styles, "text")}>
                {children}
            </div>
            <div className={accessClassName(styles, "icon")}>
                <FaTimesCircle/>
            </div>
        </div>
    );
});