import { BuildFunction, WordView } from "@app/tricky-components";
import { accessClassName } from "@app/utils";
import { withClassName, withEventListener } from "@app/utils/hoc";
import React from "react";
import { Action, DeleteState } from "../_utils/types";
import styles from "./_styles.scss";

export interface DeleteBodyProps {
    state: DeleteState;
    dispatch: React.Dispatch<Action>;
}

function createBuildFn(dispatch: React.Dispatch<Action>): BuildFunction {
    return (Component, data) => {
        let output = Component;
        if (data.type !== "word") {
            output = withEventListener(output, "click", () => dispatch({
                type: "delete",
                id: data.id
            }));
        } else {
            output = withClassName(output, accessClassName(styles, "word"));
        }
        return output;
    };
}

export const DeleteBody: React.VFC<DeleteBodyProps> = ({ dispatch }) => {
    const buildFn = createBuildFn(dispatch);
    return (
        <>
            <WordView buildFn={buildFn}/>
        </>
    );
};