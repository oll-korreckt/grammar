import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { accessClassName, DiagramState, DiagramStateContext, WordViewContext, WordViewMode } from "@app/utils";
import { Action, EditActiveState, NavigateState, State } from "./_utils/types";
import styles from "./_styles.scss";
import { useWordViewAssembly } from "./_utils/reducer";
import { NavigateBody } from "./_NavigateBody";
import { AddBody } from "./_AddBody/AddBody";
import { EditActiveBody } from "./_EditActiveBody/EditActiveBody";
import { EditBrowseBody } from "./_EditBrowseBody/EditBrowseBody";
import { DeleteBody } from "./_DeleteBody";
import { ExtendedModeSelector } from "./_ExtendedModeSelector";
import { LabelSelector } from "../LabelSelector";
import { NavigateMenu } from "./_NavigateMenu";
import { ClearButton } from "./_ClearButton";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";
import { PropertyEditor } from "../PropertyEditor/PropertyEditor";
import { utils } from "./_utils/utils";
import { ElementType } from "@domain/language";

export interface WordViewAssemblyProps {
    diagram: DiagramState;
    setDiagram: Dispatch<SetStateAction<DiagramState>>;
}

const Empty: React.VFC = () => <></>;

function withAppend(Component: React.VFC, AppendComponent: React.VFC): React.VFC {
    const output: React.VFC = () => (
        <>
            <Component/>
            <AppendComponent/>
        </>
    );
    output.displayName = `${Component.displayName} + ${AppendComponent.displayName}`;
    return output;
}

function mapMode(mode: WordViewMode): Exclude<WordViewMode, "edit.active"> {
    return mode === "edit.active" ? "edit.browse" : mode;
}

type Direction = "fromLeft" | "fromRight";

function getDirection(prevState: WordViewMode, newState: WordViewMode): Direction | undefined {
    type StateOrder = { [Key in WordViewMode]: number; };
    const orderObj: StateOrder = {
        "navigate": 0,
        "add": 1,
        "edit.browse": 2,
        "edit.active": 2,
        "delete": 3
    };
    const prevStateVal = orderObj[prevState];
    const newStateVal = orderObj[newState];
    const diff = newStateVal - prevStateVal;
    if (diff > 0) {
        return "fromRight";
    } else if (diff < 0) {
        return "fromLeft";
    } else {
        return undefined;
    }
}

function calcHeight(parent: HTMLElement, child?: HTMLElement): number {
    let output = 0;
    for (let index = 0; index < parent.children.length; index++) {
        const element = parent.children[index];
        if (element === child) {
            continue;
        }
        const { height } = element.getBoundingClientRect();
        if (height > output) {
            output = height;
        }
    }
    return output;
}

const modes: WordViewMode[] = [
    "navigate",
    "add",
    "edit.browse",
    "delete"
];

const variants: Variants = {
    initial: (d?: Direction) => {
        switch (d) {
            case "fromLeft":
                return { position: "absolute", x: "-110vw" };
            case "fromRight":
                return { position: "absolute", x: "110vw" };
            case undefined:
                return {};
        }
    },
    exit: (d?: Direction) => {
        switch (d) {
            case "fromLeft":
                return { position: "absolute", x: "110vw" };
            case "fromRight":
                return { position: "absolute", x: "-110vw" };
            case undefined:
                return {};
        }
    }
};

function getElementType(state: EditActiveState): ElementType {
    const currDiagram = state.editHistory.currState;
    const { type } = DiagramState.getItem(currDiagram, state.id);
    return type;
}

export const WordViewAssembly = makeRefComponent<HTMLDivElement, WordViewAssemblyProps>("WordViewAssembly", ({ diagram, setDiagram }, ref) => {
    const [state, dispatch] = useWordViewAssembly(diagram);

    let Body = Empty;
    switch (state.type) {
        case "navigate":
            const browse: React.VFC = () => (
                <DiagramStateContext.Provider value={state.diagramStateContext}>
                    <WordViewContext.Provider value={state.wordViewContext}>
                        <NavigateBody state={state} dispatch={dispatch} />
                    </WordViewContext.Provider>
                </DiagramStateContext.Provider>
            );
            browse.displayName = "Browse";
            Body = withAppend(Body, browse);
            break;
        case "add":
            const label: React.VFC = () => <AddBody state={state} dispatch={dispatch}/>;
            label.displayName = "Label";
            Body = withAppend(Body, label);
            break;
        case "edit.active":
            const editActive: React.VFC = () => <EditActiveBody state={state} dispatch={dispatch}/>;
            editActive.displayName = "EditActive";
            Body = withAppend(Body, editActive);
            break;
        case "edit.browse":
            const editBrowse: React.VFC = () => <EditBrowseBody state={state} dispatch={dispatch}/>;
            editBrowse.displayName = "EditBrowse";
            Body = withAppend(Body, editBrowse);
            break;
        case "delete":
            const deleteBrowse: React.VFC = () => <DeleteBody state={state} dispatch={dispatch}/>;
            deleteBrowse.displayName = "DeleteBrowse";
            Body = withAppend(Body, deleteBrowse);
            break;
    }

    return (
        <div ref={ref} style={{ margin: "10px" }}>
            <DiagramStateContext.Provider value={state.diagramStateContext}>
                <WordViewContext.Provider value={state.wordViewContext}>
                    <Body/>
                    <Bottom state={state} dispatch={dispatch} />
                </WordViewContext.Provider>
            </DiagramStateContext.Provider>
        </div>
    );
});

interface BottomProps {
    state: State;
    dispatch: React.Dispatch<Action>;
}

const ExtendedPropertyEditor = withClassNameProp(PropertyEditor);

const Bottom: React.VFC<BottomProps> = ({ state, dispatch }) => {
    const bottomVariants: Variants = {
        initial: {
            opacity: 1,
            y: "110%"
        },
        animation: {
            y: "0%",
            opacity: 1
        },
        exit: {
            opacity: 0,
            y: "110%"
        }
    };
    const bottomTransition: Transition = { duration: 0.2 };

    return (
        <AnimatePresence
            initial={false}
            exitBeforeEnter
        >
            {state.type === "edit.active"
                ?
                (<motion.div
                    key="0"
                    initial="initial"
                    animate="animation"
                    exit="exit"
                    onAnimationStart={() => console.log("exit start")}
                    className={accessClassName(styles, "editActiveContainer")}
                    variants={bottomVariants}
                    transition={bottomTransition}
                >
                    <div className={accessClassName(styles, "editActiveInnerContainer")}>
                        <ExtendedPropertyEditor
                            className={accessClassName(styles, "propertyEditor")}
                            state={state.editMenuState}
                            elementType={getElementType(state)}
                            dispatch={utils.mapPropertyEditorDispatch(dispatch)}
                        />
                    </div>
                </motion.div>)
                :
                (<motion.div
                    key="1"
                    initial="initial"
                    animate="animation"
                    exit="exit"
                    className={accessClassName(styles, "bottomContainer")}
                    variants={bottomVariants}
                    transition={bottomTransition}
                >
                    <Bar state={state} dispatch={dispatch} />
                </motion.div>)
            }
        </AnimatePresence>
    );
};

interface BarProps {
    state: State;
    dispatch: React.Dispatch<Action>;
}

const Bar: React.VFC<BarProps> = ({ state, dispatch }) => {
    const [height, setHeight] = useState(0);
    const childrenRef = useRef<HTMLDivElement>(null);
    const prevState = useRef(state.type);
    const directionRef = useRef<Direction | undefined>();

    function animationStart(mode: WordViewMode): void {
        if (mode !== state.type
            || childrenRef.current === null) {
            return;
        }
        const newHeight = calcHeight(childrenRef.current);
        setHeight(newHeight);
    }

    function animationEnd(): void {
        if (childrenRef.current === null) {
            return;
        }
        const newHeight = calcHeight(childrenRef.current);
        setHeight(newHeight);
    }

    useEffect(() => {
        if (childrenRef.current === null) {
            return;
        }
        setHeight(calcHeight(childrenRef.current));
    }, []);

    if (prevState.current !== state.type) {
        directionRef.current = getDirection(prevState.current, state.type);
        prevState.current = state.type;
    }

    return (
        <ExtendedModeSelector
            mode={mapMode(state.type)}
            onModeChange={(newMode) => {
                type ActionType = Extract<Action["type"], "switch mode" | "edit.active: Switch mode">;
                const actionType: ActionType = state.type === "edit.active"
                    ? "edit.active: Switch mode"
                    : "switch mode";
                dispatch({
                    type: actionType,
                    target: newMode
                });
            }}
        >
            <div
                className={accessClassName(styles, "children")}
                style={{ height: height }}
                ref={childrenRef}
            >
                <AnimatePresence
                    initial={false}
                    custom={directionRef.current}
                    onExitComplete={() => animationEnd()}
                >
                    {modes.filter((mode) => mode === state.type).map((mode) => {
                        return (
                            <motion.div
                                key={mode}
                                className={accessClassName(styles, "container")}
                                custom={directionRef.current}
                                initial="initial"
                                exit="exit"
                                onAnimationStart={() => animationStart(mode)}
                                animate={{ position: "absolute", x: 0 }}
                                variants={variants}
                                transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.5 }}
                            >
                                {mode === "navigate" &&
                                    <NavigateMenu
                                        className={accessClassName(styles, "navMenu")}
                                        state={state as NavigateState}
                                        dispatch={dispatch}
                                    />
                                }
                                {mode === "add" &&
                                    <LabelSelector
                                        elementType={state.addElementType}
                                        onAddClick={(e) => dispatch({ type: "add: Enter edit.active", elementType: e })}
                                    />
                                }
                                {mode === "edit.browse" &&
                                    <div className={accessClassName(styles, "editPrompt")}>
                                        Select element to edit
                                    </div>
                                }
                                {mode === "delete" &&
                                    <div className={accessClassName(styles, "clearContainer")}>
                                        <ExtendedClearButton
                                            className={accessClassName(
                                                styles,
                                                containsLabels(state.diagramStateContext.state)
                                                    ? "enableClear"
                                                    : "disableClear"
                                            )}
                                            onClick={() => {
                                                if (window.confirm("This will delete all labels. Continue?")) {
                                                    dispatch({ type: "delete: all" });
                                                }
                                            }}
                                        />
                                    </div>
                                }
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ExtendedModeSelector>
    );
};

function containsLabels(state: DiagramState): boolean {
    const values = Object.values(state.elements);
    return values.length > state.wordOrder.length;
}

const ExtendedClearButton = withEventProp(
    withClassNameProp(ClearButton),
    "click"
);

