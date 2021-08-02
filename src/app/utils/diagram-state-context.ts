import { createContext, Dispatch, SetStateAction } from "react";
import { DiagramState } from "./diagram-state";
import { DisplayModel } from "./display-model";
import { HistoryState } from "./history-state";

export interface DiagramStateContext {
    state: HistoryState<DiagramState>;
    setState: Dispatch<SetStateAction<HistoryState<DiagramState>>>;
    model: DisplayModel;
}

const state = HistoryState.init<DiagramState>({
    wordOrder: [],
    elements: {}
});
const model = DisplayModel.init(state.currState);
export const DiagramStateContext = createContext<DiagramStateContext>({
    state: state,
    model: model,
    setState: () => { throw "not implemented"; }
});