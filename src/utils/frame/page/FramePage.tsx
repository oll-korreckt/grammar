import { AddMenuViewProps } from "@app/tricky-components/AddMenuView";
import { EditActiveMenuProps, EditActiveMenuState } from "@app/tricky-components/EditActiveMenu";
import { EditForm } from "@app/tricky-components/EditForm";
import { EditFormFrameRenderProps } from "@app/tricky-components/EditFormFrameRender";
import { NavigateMenuProps } from "@app/tricky-components/NavigateMenu";
import { InputFrameRenderState, LabelFrameRenderState, DisplayStateContext, useDisplayState, ClickListenerContext } from "@app/utils";
import { SERVER } from "config";
import React from "react";
import { useMutation } from "react-query";
import { Frame } from "../types";

interface PostArgs {
    animatingElement?: string;
    renderState: InputFrameRenderState | LabelFrameRenderState;
}

async function postFn({ renderState, animatingElement }: PostArgs): Promise<void> {
    const data = convertToFrame(renderState);
    const frame: Frame = { data };
    if (animatingElement) {
        frame.animatingElement = animatingElement;
    }
    const queryStr = `${SERVER}/api/frame/player`;
    const response = await fetch(
        queryStr,
        {
            method: "POST",
            body: JSON.stringify(frame)
        }
    );
    if (!response.ok) {
        let errMsg = `error while updating data for '${queryStr}'`;
        try {
            errMsg = await response.text();
        } catch {
            // do nothing
        }
        throw errMsg;
    }
}

function convertToFrame(renderState: InputFrameRenderState | LabelFrameRenderState): EditFormFrameRenderProps {
    if (renderState.type === "input") {
        const { inputText, showErrors, disableLabelMode } = renderState;
        return {
            editMode: "input",
            inputText,
            showErrors,
            disableLabelMode
        };
    }
    type StateData = {
        mode: "navigate";
        navBarProps: NavigateMenuProps;
    } | {
        mode: "add";
        navBarProps: AddMenuViewProps;
    } | {
        mode: "edit.active";
        navBarProps: EditActiveMenuProps;
    }
    let stateData: StateData;
    switch (renderState.mode) {
        case "navigate": {
            const { category, enableUpLevel } = renderState;
            stateData = {
                mode: "navigate",
                navBarProps: {
                    category,
                    enableUpLevel
                }
            };
            break;
        }
        case "add": {
            const { category, elements } = renderState;
            stateData = {
                mode: "add",
                navBarProps: {
                    category,
                    children: elements
                }
            };
            break;
        }
        case "edit.active": {
            let state: EditActiveMenuState;
            if (renderState.editState === "display") {
                const { allowSubmit, assigned, unassigned } = renderState;
                state = {
                    type: "display",
                    allowSubmit,
                    assigned,
                    unassigned
                };
            } else {
                const { allowSubmit, property } = renderState;
                state = {
                    type: "edit",
                    allowSubmit,
                    property
                };
            }
            const { elementType } = renderState;
            stateData = {
                mode: "edit.active",
                navBarProps: {
                    state,
                    elementType
                }
            };
            break;
        }
        default: {
            throw `Unsupported mode '${(renderState as any).mode}'`;
        }
    }
    const { labelSettings, lexemes } = renderState;
    return {
        editMode: "label",
        settings: labelSettings,
        children: lexemes,
        ...stateData
    };
}

export const FramePage: React.VFC = () => {
    const { state, dispatch, assembledState } = useDisplayState();
    const post = useMutation(postFn);

    function onElementClick(id: string | undefined): void {
        if (id === undefined) {
            throw "Undefined element clicked";
        }
        if (assembledState !== undefined) {
            post.mutate({
                animatingElement: id,
                renderState: assembledState
            });
        }
    }

    return (
        <ClickListenerContext.Provider value={{ onElementClick }}>
            <DisplayStateContext.Provider value={{ state, dispatch }}>
                <EditForm />
            </DisplayStateContext.Provider>
        </ClickListenerContext.Provider>
    );
};