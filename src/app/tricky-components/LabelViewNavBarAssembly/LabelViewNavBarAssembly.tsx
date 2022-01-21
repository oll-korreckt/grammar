import { withClassNameProp } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";
import { LabelViewNavBar, LabelViewNavBarProps } from "../LabelViewNavBar";
import { LabelViewNavBarMenu, LabelViewNavBarMenuProps } from "../LabelViewNavBarMenu";
import { accessClassName, LabelFormMode } from "@app/utils";

export type LabelViewNavBarAssemblyProps = LabelViewNavBarProps & Pick<LabelViewNavBarMenuProps, "props">;

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

const ExtendedLabelViewNavBarMenu = withClassNameProp(LabelViewNavBarMenu);