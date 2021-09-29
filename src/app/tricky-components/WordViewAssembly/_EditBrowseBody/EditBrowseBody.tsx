import { BuildFunction, WordView } from "@app/tricky-components";
import { withEventListener } from "@app/utils/hoc";
import React from "react";
import { Action, EditBrowseState } from "../_utils/types";

export interface EditBrowseBodyProps {
    state: EditBrowseState;
    dispatch: React.Dispatch<Action>;
}

function createBuildFunction(dispatch: React.Dispatch<Action>): BuildFunction {
    return (Component, { id, type }) => {
        let output = Component;
        if (type !== "word") {
            output = withEventListener(output, "click", () => dispatch({
                type: "edit.browse: Enter edit.active",
                id: id
            }));
        }
        return output;
    };
}

export const EditBrowseBody: React.VFC<EditBrowseBodyProps> = ({ dispatch }) => {
    const buildFn = createBuildFunction(dispatch);
    return <WordView buildFn={buildFn}/>;
};