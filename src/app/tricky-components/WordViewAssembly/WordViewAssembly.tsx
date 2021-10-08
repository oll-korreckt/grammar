import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { makeRefComponent, RefComponent, withClassNameProp, withEventListener, withEventProp } from "@app/utils/hoc";
import { accessClassName, DiagramState, DiagramStateContext, HistoryState, WordViewContext, WordViewMode } from "@app/utils";
import { Action, NavigateState, State, StateBase } from "./_utils/types";
import styles from "./_styles.scss";
import { useWordViewAssembly } from "./_utils/reducer";
import { NavigateBody } from "./_NavigateBody";
import { AddBody } from "./_AddBody/AddBody";
import { EditActiveBody } from "./_EditActiveBody/EditActiveBody";
import { ButtonBarProps } from "@app/basic-components";
import { EditBrowseBody } from "./_EditBrowseBody/EditBrowseBody";
import { DeleteBody } from "./_DeleteBody";
import { ExtendedModeSelector } from "./_ExtendedModeSelector";
import { LabelSelector } from "../LabelSelector";
import { NavigateMenu } from "./_NavigateMenu";
import { ClearButton } from "./_ClearButton";
import { EditActiveButtons } from "./_EditActiveButtons";
import { CSSTransition } from "react-transition-group";
import { CSSTransitionClassNames, CSSTransitionProps } from "react-transition-group/CSSTransition";

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

// function createEditButtonBarBuildFn(dispatch: Dispatch<Action>): Exclude<ButtonBarProps["buildFn"], undefined> {
//     return (Component, item) => {
//         switch (item) {
//             case "Done":
//                 return withEventListener(Component, "click", () => dispatch({
//                     type: "edit: Done"
//                 }));
//             case "Cancel":
//                 return withEventListener(Component, "click", () => dispatch({
//                     type: "edit: Cancel"
//                 }));
//             default:
//                 throw `Unhandled state '${item}'`;
//         }
//     };
// }

function encloseBody(Body: React.VFC, state: StateBase, dispatch: React.Dispatch<Action>): RefComponent<HTMLDivElement> {
    return makeRefComponent<HTMLDivElement>("enclose", (_, ref) => (
        <div ref={ref}>
            <WordViewContext.Provider value={state.wordViewContext}>
                <DiagramStateContext.Provider value={state.diagramStateContext}>
                    <Body/>
                    {/* {state.type !== "edit.active" &&
                        <ExtendedModeSelector
                            mode={state.type}
                            onModeChange={(newMode) => dispatch({ type: "switch mode", target: newMode })}
                        />
                    } */}
                </DiagramStateContext.Provider>
            </WordViewContext.Provider>
        </div>
    ));
}

function createButtonBarBuildFn(dispatch: React.Dispatch<Action>): Required<ButtonBarProps>["buildFn"] {
    return (Component, item) => {
        switch (item) {
            case "Done":
                return withEventListener(Component, "click", () => dispatch({
                    type: "edit.active: Done"
                }));
            case "Cancel":
                return withEventListener(Component, "click", () => dispatch({
                    type: "edit.active: Cancel"
                }));
            default:
                throw `unhandled item ${item}`;
        }
    };
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

type TransitionProps = {
    timeout: number;
    classNames: CSSTransitionClassNames;
    unmountOnExit: true;
};

function disableDone(state: State): boolean {
    if (state.type !== "edit.active") {
        return true;
    }
    return !HistoryState.canUndo(state.editHistory);
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

export const WordViewAssembly = makeRefComponent<HTMLDivElement, WordViewAssemblyProps>("WordViewAssembly", ({ diagram, setDiagram }, ref) => {
    const [state, dispatch] = useWordViewAssembly(diagram);
    const [height, setHeight] = useState(0);
    const [direction, setDirection] = useState<Direction>();
    const childrenRef = useRef<HTMLDivElement>(null);
    const prevState = useRef(state.type);
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

    useEffect(() => {
        const newDir = getDirection(prevState.current, state.type);
        prevState.current = state.type;
        setDirection(newDir);
    }, [state.type]);

    useEffect(() => {
        console.log("first");
        if (childrenRef.current === null) {
            return;
        }
        setHeight(calcHeight(childrenRef.current));
    }, []);

    const transitionProps = useMemo<CSSTransitionProps>(() => {
        const output: CSSTransitionProps = {
            timeout: 2000,
            onEnter: () => childrenRef.current && setHeight(calcHeight(childrenRef.current)),
            onExited: (e: HTMLElement) => childrenRef.current && setHeight(calcHeight(childrenRef.current, e)),
            unmountOnExit: true
        };
        console.log("direction", direction);
        if (direction !== undefined) {
            output.classNames = {
                enter: accessClassName(styles, `${direction}Enter`),
                enterActive: accessClassName(styles, "enterActive"),
                exit: accessClassName(styles, "exit"),
                exitActive: accessClassName(styles, `${direction}ExitActive`)
            };
        }
        return output;
    }, [direction]);
    return (
        <div ref={ref}>
            <DiagramStateContext.Provider value={state.diagramStateContext}>
                <WordViewContext.Provider value={state.wordViewContext}>
                    <Body/>
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
                            <CSSTransition
                                in={state.type === "navigate"}
                                {...transitionProps}
                            >
                                <div className={accessClassName(styles, "container")}>
                                    <NavigateMenu
                                        className={accessClassName(styles, "navMenu")}
                                        state={state as NavigateState}
                                        dispatch={dispatch}
                                    />
                                </div>
                            </CSSTransition>

                            <CSSTransition
                                in={state.type === "add"}
                                {...transitionProps}
                            >
                                <div className={accessClassName(styles, "container")}>
                                    <LabelSelector
                                        elementType={state.addElementType}
                                        onElementTypeSelect={(e) => dispatch({ type: "add: elementType", elementType: e })}
                                        onAddClick={() => dispatch({ type: "add: Enter edit.active" })}
                                    />
                                </div>
                            </CSSTransition>

                            <CSSTransition
                                in={state.type === "edit.active"}
                                {...transitionProps}
                            >
                                <div className={accessClassName(styles, "container")}>
                                    <EditActiveButtons
                                        onDone={() => dispatch({ type: "edit.active: Done" })}
                                        onCancel={() => dispatch({ type: "edit.active: Cancel" })}
                                        disableDone={disableDone(state)}
                                    />
                                </div>
                            </CSSTransition>

                            <CSSTransition
                                in={state.type === "delete"}
                                {...transitionProps}
                            >
                                <div className={accessClassName(styles, "container")}>
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
                                </div>
                            </CSSTransition>
                        </div>
                    </ExtendedModeSelector>
                </WordViewContext.Provider>
            </DiagramStateContext.Provider>
        </div>
    );
});

function containsLabels(state: DiagramState): boolean {
    const values = Object.values(state.elements);
    return values.length > state.wordOrder.length;
}

const ExtendedClearButton = withEventProp(
    withClassNameProp(ClearButton),
    "click"
);

