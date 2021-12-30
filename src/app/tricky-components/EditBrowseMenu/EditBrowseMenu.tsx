import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.scss";


export const EditBrowseMenu: React.VFC = () => {
    return (
        <span className={accessClassName(styles, "editBrowseMenu")}>
            Select Element to Edit
        </span>
    );
};