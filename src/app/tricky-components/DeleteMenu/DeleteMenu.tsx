import { accessClassName } from "@app/utils";
import React from "react";
import { FaBomb } from "react-icons/fa";
import styles from "./_styles.scss";

export interface DeleteMenuProps {
    onClick?: () => void;
}

export const DeleteMenu: React.VFC<DeleteMenuProps> = ({ onClick }) => {
    return (
        <div
            className={accessClassName(styles, "deleteMenu")}
            onClick={() => onClick && onClick()}
        >
            <div className={accessClassName(styles, "content")}>
                <FaBomb className={accessClassName(styles, "icon")}/>
                <div className={accessClassName(styles, "children")}>Delete All</div>
            </div>
        </div>
    );
};