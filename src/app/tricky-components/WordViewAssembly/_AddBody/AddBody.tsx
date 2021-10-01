import { WordView } from "@app/tricky-components";
import React from "react";
import { Action, AddState } from "../_utils/types";

export interface AddProps {
    state: AddState;
    dispatch: React.Dispatch<Action>;
}

export const AddBody: React.VFC<AddProps> = ({ state }) => {
    const addButtonClasses: string[] = [];
    if (state.addElementType === undefined) {
        addButtonClasses.push("addButtonDisabled");
    }

    return <WordView/>;
};