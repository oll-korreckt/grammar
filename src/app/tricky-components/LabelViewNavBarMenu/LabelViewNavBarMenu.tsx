import { accessClassName, LabelFormMode } from "@app/utils";
import { makeRefComponent, RefComponent } from "@app/utils/hoc";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { useRef } from "react";
import styles from "./_styles.module.scss";

type Direction = "fromLeft" | "fromRight";

const modeOrder: Record<LabelFormMode, number> = {
    "navigate": 0,
    "add": 1,
    "edit.browse": 2,
    "edit.active": 3,
    "delete": 4
};

const allModes: LabelFormMode[] = Object.entries(modeOrder)
    .sort(([, value1], [, value2]) => value2 - value1)
    .map(([mode]) => mode as LabelFormMode);

function getDirection(prevMode: LabelFormMode, currMode: LabelFormMode): Direction | undefined {
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

function createVariants(unit?: string): Variants  {
    const pos = unit !== undefined ? unit : "110vw";
    const neg = `-${pos}`;
    return {
        initial: (d: Direction | undefined) => {
            switch (d) {
                case "fromLeft":
                    return { x: neg };
                case "fromRight":
                    return { x: pos };
                case undefined:
                    return {};
            }
        },
        exit: (d: Direction | undefined) => {
            switch (d) {
                case "fromLeft":
                    return { x: pos };
                case "fromRight":
                    return { x: neg };
                case undefined:
                    return {};
            }
        }
    };
}

export type LabelViewNavBarMenuProps<TNavProps, TAddProps, TEditBrowseProps, TEditActiveProps, TDeleteProps> =
{
    unit?: string;
} & ({
    mode: "navigate";
    props: TNavProps;
} | {
    mode: "add";
    props: TAddProps;
} | {
    mode: "edit.browse";
    props: TEditBrowseProps;
} | {
    mode: "edit.active";
    props: TEditActiveProps;
} | {
    mode: "delete";
    props: TDeleteProps;
})

interface ArgItem<Type> {
    sizeClass: string;
    Component: React.VFC<Type>;
}

export interface Args<TNavProps, TAddProps, TEditBrowseProps, TEditActiveProps, TDeleteProps> {
    navigate: ArgItem<TNavProps>;
    add: ArgItem<TAddProps>;
    "edit.browse": ArgItem<TEditBrowseProps>;
    "edit.active": ArgItem<TEditActiveProps>;
    delete: ArgItem<TDeleteProps>;
}

const containerClasses: Record<LabelFormMode, string> = {
    "navigate": "navigateContainer",
    "add": "addContainer",
    "edit.browse": "editBrowseContainer",
    "edit.active": "editActiveContainer",
    "delete": "deleteContainer"
};

export function createLabelViewNavBarMenu<TNavProps, TAddProps, TEditBrowseProps, TEditActiveProps, TDeleteProps>(args: Args<TNavProps, TAddProps, TEditBrowseProps, TEditActiveProps, TDeleteProps>): RefComponent<HTMLDivElement, LabelViewNavBarMenuProps<TNavProps, TAddProps, TEditBrowseProps, TEditActiveProps, TDeleteProps>> {
    const NavMenu = args.navigate.Component;
    const AddMenu = args.add.Component;
    const EditBrowseMenu = args["edit.browse"].Component;
    const EditActiveMenu = args["edit.active"].Component;
    const DeleteMenu = args.delete.Component;
    const sizeClasses: Record<LabelFormMode, string> = {
        navigate: args.navigate.sizeClass,
        add: args.add.sizeClass,
        "edit.browse": args["edit.browse"].sizeClass,
        "edit.active": args["edit.active"].sizeClass,
        delete: args.delete.sizeClass
    };
    return makeRefComponent<HTMLDivElement, LabelViewNavBarMenuProps<TNavProps, TAddProps, TEditBrowseProps, TEditActiveProps, TDeleteProps>>("LabelViewNavBarMenu", ({ mode, unit, props }, ref) => {
        const prevMode = useRef(mode);
        const directionRef = useRef<Direction>();

        const variants = createVariants(unit);

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
                        const containerClassName = containerClasses[wvMode];
                        const containerClass = accessClassName(styles, containerClassName);
                        const givenClass = sizeClasses[wvMode];
                        const className = `${containerClass} ${givenClass}`;
                        return (
                            <motion.div
                                key={wvMode}
                                custom={directionRef.current}
                                className={className}
                                initial="initial"
                                animate={{ x: 0 }}
                                exit="exit"
                                variants={variants}
                                transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.5 }}
                            >
                                {mode === "navigate" &&
                                    <NavMenu {...props}/>
                                }
                                {mode === "add" &&
                                    <AddMenu {...props}/>
                                }
                                {mode === "edit.browse" &&
                                    <EditBrowseMenu {...props}/>
                                }
                                {mode === "edit.active" &&
                                    <EditActiveMenu {...props}/>
                                }
                                {mode === "delete" &&
                                    <DeleteMenu {...props}/>
                                }
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        );
    });
}