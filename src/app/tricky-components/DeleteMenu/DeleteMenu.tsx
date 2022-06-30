import { accessClassName } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.module.scss";
import { DeleteMenuButton } from "../DeleteMenuButton";
import { DeleteMenuPrompt } from "../DeleteMenuPrompt";
import { MessageBoxModal } from "@app/basic-components/MessageBoxModal";

export interface DeleteMenuProps {
    allowDeleteAll?: boolean;
    showPrompt?: boolean;
    onDeleteAll?: () => void;
    onDeleteAllYes?: () => void;
    onDeleteAllCancel?: () => void;
}

export const DeleteMenu: React.VFC<DeleteMenuProps> = ({ allowDeleteAll, showPrompt, onDeleteAll, onDeleteAllYes, onDeleteAllCancel }) => {
    const YES = "Yes";
    const NO = "No";

    const deleteMenuBtnClasses = ["deleteMenuButton"];
    if (allowDeleteAll !== true) {
        deleteMenuBtnClasses.push("deleteMenuButtonDisable");
    }

    return (
        <div className={accessClassName(styles, "deleteMenu")}>
            <ExtendedDeleteMenuPrompt className={accessClassName(styles, "deleteMenuPrompt")} />
            <ExtendedDeleteMenuButton
                className={accessClassName(styles, ...deleteMenuBtnClasses)}
                onClick={() => onDeleteAll && onDeleteAll()}
            />
            {showPrompt &&
                <MessageBoxModal
                    buttons={[
                        { text: YES, alignment: "right" },
                        { text: NO, alignment: "right" }
                    ]}
                    onResponse={(response) => {
                        if (response.type === "off screen click") {
                            onDeleteAllCancel && onDeleteAllCancel();
                        } else if (response.text === YES) {
                            onDeleteAllYes && onDeleteAllYes();
                        } else if (response.text === NO) {
                            onDeleteAllCancel && onDeleteAllCancel();
                        } else {
                            throw "Unhandled response";
                        }
                    }}
                >
                    Delete all labels?
                </MessageBoxModal>
            }
        </div>
    );
};

const ExtendedDeleteMenuPrompt = withClassNameProp(DeleteMenuPrompt);
const ExtendedDeleteMenuButton = withClassNameProp(DeleteMenuButton);