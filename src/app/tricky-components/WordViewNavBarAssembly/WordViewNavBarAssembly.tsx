import { withClassNameProp } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";
import { WordViewNavBar, WordViewNavBarProps } from "../WordViewNavBar";
import { WordViewNavBarMenu, WordViewNavBarMenuProps } from "../WordViewNavBarMenu";
import { accessClassName, WordViewMode } from "@app/utils";

export type WordViewNavBarAssemblyProps = WordViewNavBarProps & Pick<WordViewNavBarMenuProps, "props">;

export const WordViewNavBarAssembly: React.VFC<WordViewNavBarAssemblyProps> = ({ mode, onModeChange, props }) => {
    return (
        <WordViewNavBar mode={mode} onModeChange={onModeChange}>
            <ExtendedWordViewNavBarMenu
                className={accessClassName(styles, "wordViewNavBarMenuPosition")}
                mode={WordViewMode.getDefault(mode) as any}
                props={props as any}
            />
        </WordViewNavBar>
    );
};

const ExtendedWordViewNavBarMenu = withClassNameProp(WordViewNavBarMenu);