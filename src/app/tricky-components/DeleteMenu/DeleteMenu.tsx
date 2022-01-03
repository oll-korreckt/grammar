import { accessClassName } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";
import { DeleteMenuButton } from "../DeleteMenuButton";
import { DeleteMenuPrompt } from "../DeleteMenuPrompt";

export interface DeleteMenuProps {
    onDeleteAll?: () => void;
}

export const DeleteMenu: React.VFC<DeleteMenuProps> = ({ onDeleteAll }) => {
    return (
        <div className={accessClassName(styles, "deleteMenu")}>
            <ExtendedDeleteMenuPrompt className={accessClassName(styles, "deleteMenuPrompt")}/>
            <ExtendedDeleteMenuButton
                className={accessClassName(styles, "deleteMenuButton")}
                onClick={() => onDeleteAll && onDeleteAll()}
            />
        </div>
    );
};

const ExtendedDeleteMenuPrompt = withClassNameProp(DeleteMenuPrompt);
const ExtendedDeleteMenuButton = withClassNameProp(DeleteMenuButton);