import { accessClassName } from "@app/utils";
import React from "react";
import { AddMenuProps } from "../AddMenu";
import { DeleteMenuButtonProps } from "../DeleteMenuButton";
import { EditActiveMenuProps } from "../EditActiveMenu";
import { EditBrowseMenuProps } from "../EditBrowseMenu";
import { LabelSettings, Lexeme } from "../LabelView";
import { LabelViewAssembly } from "../LabelViewAssembly";
import { LabelViewNavBarAssembly } from "../LabelViewNavBarAssembly";
import { NavigateMenuProps } from "../NavigateMenu";
import LabelFormViewStyles from "../LabelFormView/_styles.module.scss";

export type LabelFrameRenderProps = {
    settings?: Record<string, LabelSettings>;
    children?: Lexeme[];
} & ({
    mode: "navigate";
    navBarProps: NavigateMenuProps;
} | {
    mode: "add";
    navBarProps: AddMenuProps;
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
            <LabelViewNavBarAssembly
                mode={mode}
                props={navBarProps}
            />
        </div>
    );
};