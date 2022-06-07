import { withClassNameProp } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.module.scss";
import { LabelViewNavBar, LabelViewNavBarProps } from "../LabelViewNavBar";
import { createLabelViewNavBarMenu, LabelViewNavBarMenuProps } from "../LabelViewNavBarMenu";
import { accessClassName, LabelFormMode } from "@app/utils";
import { NavigateMenu, NavigateMenuProps } from "../NavigateMenu";
import { AddMenu, AddMenuProps } from "../AddMenu";
import { EditBrowseMenu, EditBrowseMenuProps } from "../EditBrowseMenu";
import { DeleteMenu, DeleteMenuProps } from "../DeleteMenu";
import { EditActiveMenuInterface, EditActiveMenuInterfaceProps } from "../EditActiveMenuInterface";

export type LabelViewNavBarAssemblyProps = LabelViewNavBarProps & Pick<LabelViewNavBarMenuProps<NavigateMenuProps, AddMenuProps, EditBrowseMenuProps, EditActiveMenuInterfaceProps, DeleteMenuProps>, "props">;

export const LabelViewNavBarAssembly: React.VFC<LabelViewNavBarAssemblyProps> = ({ mode, onModeChange, props }) => {
    return (
        <LabelViewNavBar mode={mode} onModeChange={onModeChange}>
            <ExtendedLabelViewNavBarMenu
                className={accessClassName(styles, "labelViewNavBarMenuPosition")}
                mode={LabelFormMode.getDefault(mode) as any}
                props={props as any}
            />
        </LabelViewNavBar>
    );
};

const ExtendedLabelViewNavBarMenu = withClassNameProp(createLabelViewNavBarMenu(
    "LabelViewNavBarMenu",
    NavigateMenu,
    AddMenu,
    EditBrowseMenu,
    EditActiveMenuInterface,
    DeleteMenu
));