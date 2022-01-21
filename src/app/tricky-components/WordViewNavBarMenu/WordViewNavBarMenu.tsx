import { accessClassName, WordViewMode } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { useRef } from "react";
import { AddMenu, AddMenuProps } from "../AddMenu";
import { DeleteMenu, DeleteMenuProps } from "../DeleteMenu";
import { EditActiveMenuInterface, EditActiveMenuInterfaceProps } from "../EditActiveMenuInterface";
import { EditBrowseMenu, EditBrowseMenuProps } from "../EditBrowseMenu";
import { NavigateMenu, NavigateMenuProps } from "../NavigateMenu";
import styles from "./_styles.scss";

export type WordViewNavBarMenuProps =
    | MenuState<"navigate">
    | MenuState<"add">
    | MenuState<"edit.browse">
    | MenuState<"edit.active">
    | MenuState<"delete">;

type MenuState<TMode extends WordViewMode> =
    TMode extends "navigate" ? { mode: TMode; props: NavigateMenuProps; }
        : TMode extends "add" ? { mode: TMode; props: AddMenuProps; }
        : TMode extends "edit.browse" ? { mode: TMode; props: EditBrowseMenuProps; }
        : TMode extends "edit.active" ? { mode: TMode; props: EditActiveMenuInterfaceProps; }
        : TMode extends "delete" ? { mode: TMode; props: DeleteMenuProps; }
        : never;

type Direction = "fromLeft" | "fromRight";

const modeOrder: Record<WordViewMode, number> = {
    "navigate": 0,
    "add": 1,
    "edit.browse": 2,
    "edit.active": 3,
    "delete": 4
};

const allModes: WordViewMode[] = Object.entries(modeOrder)
    .sort(([, value1], [, value2]) => value2 - value1)
    .map(([mode]) => mode as WordViewMode);

function getDirection(prevMode: WordViewMode, currMode: WordViewMode): Direction | undefined {
    const prevModeOrder = modeOrder[prevMode];
    const currModeOrder = modeOrder[currMode];
    const diff = currModeOrder - prevModeOrder;
    if (diff > 0) {
        return "fromRight";
    } else if (diff < 0) {
        return "fromLeft";
    } else {
        return undefined;
    }
}

const negVw = "-110vw";
const posVw = "110vw";

const variants: Variants = {
    initial: (d: Direction | undefined) => {
        switch (d) {
            case "fromLeft":
                return { x: negVw };
            case "fromRight":
                return { x: posVw };
            case undefined:
                return {};
        }
    },
    exit: (d: Direction | undefined) => {
        switch (d) {
            case "fromLeft":
                return { x: posVw };
            case "fromRight":
                return { x: negVw };
            case undefined:
                return {};
        }
    }
};

const containerClasses: Record<WordViewMode, string[]> = {
    "navigate": ["navigateContainer"],
    "add": ["addContainer"],
    "edit.browse": ["editBrowseContainer"],
    "edit.active": ["editActiveContainer"],
    "delete": ["deleteContainer"]
};

export const WordViewNavBarMenu = makeRefComponent<HTMLDivElement, WordViewNavBarMenuProps>("WordViewNavBarMenu", ({ mode, props }, ref) => {
    const prevMode = useRef(mode);
    const directionRef = useRef<Direction>();

    if (mode !== prevMode.current) {
        directionRef.current = getDirection(prevMode.current, mode);
        prevMode.current = mode;
    }

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "menuContainer")}
        >
            <AnimatePresence
                initial={false}
                custom={directionRef.current}
            >
                {allModes.filter((wvMode) => wvMode === mode).map((wvMode) => {
                    const classes = containerClasses[wvMode];
                    return (
                        <motion.div
                            key={wvMode}
                            custom={directionRef.current}
                            className={accessClassName(styles, ...classes)}
                            initial="initial"
                            animate={{ x: 0 }}
                            exit="exit"
                            variants={variants}
                            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.5 }}
                        >
                            {mode === "navigate" &&
                                <NavigateMenu {...props as NavigateMenuProps}/>
                            }
                            {mode === "add" &&
                                <AddMenu {...props as AddMenuProps}/>
                            }
                            {mode === "edit.browse" &&
                                <EditBrowseMenu/>
                            }
                            {mode === "edit.active" &&
                                <EditActiveMenuInterface {...props as EditActiveMenuInterfaceProps}/>
                            }
                            {mode === "delete" &&
                                <DeleteMenu {...props as DeleteMenuProps}/>
                            }
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
});