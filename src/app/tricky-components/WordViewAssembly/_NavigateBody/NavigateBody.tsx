import { withFade } from "@app/basic-components/Word";
import { BuildFunction, WordView } from "@app/tricky-components";
import { withEventListener } from "@app/utils/hoc";
import React from "react";
import { Action, NavigateState } from "../_utils/types";

export interface NavigateBodyProps {
    state: NavigateState;
    dispatch: React.Dispatch<Action>;
}

function createTemplateBuildFn(dispatch: React.Dispatch<Action>): BuildFunction {
    return (Component, data) => {
        return data.type === "word"
            ? withFade(Component)
            : withEventListener(Component, "click", () => dispatch({
                type: "navigate: selectedItem",
                selectedElement: data.id
            }));
    };
}

export const NavigateBody: React.VFC<NavigateBodyProps> = ({ dispatch }) => {
    const buildFn = createTemplateBuildFn(dispatch);

    return <WordView buildFn={buildFn}/>;
};