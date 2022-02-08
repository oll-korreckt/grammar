import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import { FaBomb } from "react-icons/fa";
import styles from "./_styles.module.scss";

export interface DeleteMenuButtonProps {
    onClick?: () => void;
}

export const DeleteMenuButton = makeRefComponent<HTMLDivElement, DeleteMenuButtonProps>("DeleteMenuButton", ({ onClick }, ref) => {
    return (
        <div
            ref={ref}
            className={accessClassName(styles, "deleteMenuButton")}
            onClick={() => onClick && onClick()}
        >
            <div className={accessClassName(styles, "content")}>
                <FaBomb className={accessClassName(styles, "icon")} />
                <div className={accessClassName(styles, "children")}>Delete All</div>
            </div>
        </div>
    );
});