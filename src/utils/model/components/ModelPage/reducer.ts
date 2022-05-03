import React, { useReducer } from "react";
import { Action, ModelPageState } from "../types";
import { getAddressClusters } from "./utils";

function reducer(state: ModelPageState, action: Action): ModelPageState {
    switch (action.type) {
        case "loading: data fetched":
            const clusters = getAddressClusters(action.data);
            return {
                ...state,
                data: clusters,
                type: "data"
            };
        case "loading: fetch error":
            return {
                ...state,
                type: "error"
            };
    }
}

export function useModelPage(): [ModelPageState, React.Dispatch<Action>] {
    return useReducer(reducer, { type: "initial", data: [] });
}