import { accessClassName } from "@app/utils";
import React from "react";
import { DeleteMenuButtonProps } from "../DeleteMenuButton";
import { EditActiveMenu, EditActiveMenuProps } from "../EditActiveMenu";
import { EditBrowseMenu, EditBrowseMenuProps } from "../EditBrowseMenu";
import { LabelSettings, Lexeme } from "../LabelView";
import { LabelViewAssembly } from "../LabelViewAssembly";
import { NavigateMenu, NavigateMenuProps } from "../NavigateMenu";
import LabelFormViewStyles from "../LabelFormView/_styles.module.scss";
import { createLabelViewNavBarMenu } from "../LabelViewNavBarMenu";
import { AddMenuView, AddMenuViewProps } from "../AddMenuView";
import { DeleteMenu, DeleteMenuProps } from "../DeleteMenu";
import { LabelViewNavBar } from "../LabelViewNavBar";
import styles from "./_styles.module.scss";
import { withClassNameProp } from "@app/utils/hoc";

export type LabelFrameRenderProps = {
    settings?: Record<string, LabelSettings>;
    children?: Lexeme[];
} & ({
    mode: "navigate";
    navBarProps: NavigateMenuProps;
} | {
    mode: "add";
    navBarProps: AddMenuViewProps;
} | {
    mode: "edit.browse";
    navBarProps: EditBrowseMenuProps;
} | {
    mode: "edit.active";
    navBarProps: EditActiveMenuProps;
} | {
    mode: "delete";
    navBarProps: DeleteMenuButtonProps;
})

export const LabelFrameRender: React.VFC<LabelFrameRenderProps> = ({ mode, navBarProps, settings, children }) => {
    return (
        <div className={accessClassName(LabelFormViewStyles, "labelForm")}>
            <LabelViewAssembly
                mode={mode}
                settings={settings}
            >
                {children}
            </LabelViewAssembly>
            <LabelViewNavBar mode={mode}>
                <ExtendedLabelViewNavBarMenu
                    className={accessClassName(styles, "labelViewNavBarMenuPosition")}
                    mode={mode as any}
                    props={navBarProps}
                />
            </LabelViewNavBar>
        </div>
    );
};

const ExtendedLabelViewNavBarMenu = withClassNameProp(createLabelViewNavBarMenu<NavigateMenuProps, AddMenuViewProps, EditBrowseMenuProps, EditActiveMenuProps, DeleteMenuProps>({
    navigate: {
        sizeClass: accessClassName(styles, "navigateContainer"),
        Component: NavigateMenu as React.VFC<NavigateMenuProps>
    },
    add: {
        sizeClass: accessClassName(styles, "addContainer"),
        Component: AddMenuView
    },
    "edit.browse": {
        sizeClass: accessClassName(styles, "editBrowseContainer"),
        Component: EditBrowseMenu
    },
    "edit.active": {
        sizeClass: accessClassName(styles, "editActiveContainer"),
        Component: EditActiveMenu
    },
    delete: {
        sizeClass: accessClassName(styles, "deleteContainer"),
        Component: DeleteMenu
    }
}));