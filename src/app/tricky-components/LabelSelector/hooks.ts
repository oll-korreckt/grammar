import { DerivationTree } from "@app/utils";
import { ElementType } from "@domain/language";
import React, { useReducer } from "react";


export type LabelCategory = (keyof DerivationTree) | "coordinated";

export type LabelSelectorState = {
    selectedCategory?: LabelCategory;
    selectedType?: ElementType;
};

export type LabelSelectorAction = {
    type: "selectedCategory";
    selectedCategory: LabelCategory;
} | {
    type: "selectedType";
    selectedType: ElementType;
}

function reducer(state: LabelSelectorState, action: LabelSelectorAction): LabelSelectorState {
    switch (action.type) {
        case "selectedCategory":
            return {
                ...state,
                selectedCategory: action.selectedCategory
            };
        case "selectedType":
            return {
                ...state,
                selectedType: action.selectedType
            };
    }
}

export function useLabelSelector(initialState?: LabelSelectorState): [LabelSelectorState, React.Dispatch<LabelSelectorAction>] {
    return useReducer(
        reducer,
        initialState !== undefined ? initialState : {}
    );
}