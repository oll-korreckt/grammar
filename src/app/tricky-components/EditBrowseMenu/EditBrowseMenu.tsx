import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.modules.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EditBrowseMenuProps {
}


export const EditBrowseMenu: React.VFC<EditBrowseMenuProps> = () => {
    return (
        <span className={accessClassName(styles, "editBrowseMenu")}>
            Select Element to Edit
        </span>
    );
};