import React, { Dispatch, SetStateAction } from "react";
import { makeRefComponent, RefComponent, withEventListener } from "@app/utils/hoc";
import { DiagramState, DiagramStateContext, WordViewContext, WordViewMode } from "@app/utils";
import { Action, StateBase, WordViewAssemblyContext } from "./_utils/types";
import styles from "./_styles.scss";
import { Ids } from "@app/testing";
import { useWordViewAssembly } from "./_utils/reducer";
import { NavigateBody } from "./_NavigateBody";
import { AddBody } from "./_AddBody/AddBody";
import { EditActiveBody } from "./_EditActiveBody/EditActiveBody";
import { ButtonBar, ButtonBarProps } from "@app/basic-components";
import { EditBrowseBody } from "./_EditBrowseBody/EditBrowseBody";
import { DeleteBody } from "./_DeleteBody";
import { ExtendedModeSelector } from "./_ExtendedModeSelector";

export interface WordViewAssemblyProps {
    diagram: DiagramState;
    setDiagram: Dispatch<SetStateAction<DiagramState>>;
}

type EditButtonBarItems = ["Done", "Cancel"];

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
            const editActive: React.VFC = () => (
                <>
                    <EditActiveBody state={state} dispatch={dispatch}/>
                    <ButtonBar
                        buildFn={createButtonBarBuildFn(dispatch)}
                    >
                        {["Done", "Cancel"]}
                    </ButtonBar>
                </>
            );
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
        <div ref={ref}>
            <DiagramStateContext.Provider value={state.diagramStateContext}>
                <WordViewContext.Provider value={state.wordViewContext}>
                    <Body/>
                    {state.type !== "edit.active" &&
                        <ExtendedModeSelector
                            mode={state.type}
                            onModeChange={(newMode) => dispatch({ type: "switch mode", target: newMode })}
                        />
                    }
                </WordViewContext.Provider>
            </DiagramStateContext.Provider>
        </div>
    );
});