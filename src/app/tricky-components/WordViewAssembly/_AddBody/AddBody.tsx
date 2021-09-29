import { WordView } from "@app/tricky-components";
import { accessClassName } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import React from "react";
import { Action, AddState } from "../_utils/types";
import { FaPlus } from "react-icons/fa";
import styles from "./_styles.scss";
import { LabelSelector } from "@app/tricky-components/LabelSelector";

export interface AddProps {
    state: AddState;
    dispatch: React.Dispatch<Action>;
}

export const AddBody: React.VFC<AddProps> = ({ state, dispatch }) => {
    const addButtonClasses: string[] = [];
    if (state.addElementType === undefined) {
        addButtonClasses.push("addButtonDisabled");
    }

    return (
        <>
            <WordView/>
            <ExtendedAddButton
                className={accessClassName(styles, ...addButtonClasses)}
                onClick={() => dispatch({ type: "add: Enter edit.active" })}
            />
            <LabelSelector
                elementType={state.addElementType}
                onElementTypeSelect={(e) => dispatch({ type: "add: elementType", elementType: e })}
            />
        </>
    );
};

const AddButton = makeRefComponent<HTMLDivElement>("AddButton", (_, ref) => {
    return (
        <div className={accessClassName(styles, "addButton")} ref={ref}>
            <FaPlus/>
        </div>
    );
});

const ExtendedAddButton = withClassNameProp(withEventProp(AddButton, "click"));