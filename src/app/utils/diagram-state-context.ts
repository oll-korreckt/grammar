import { createContext, Dispatch, SetStateAction } from "react";
import { DiagramState } from "./diagram-state";
import { DisplayModel, Progress } from "./display-model";
import { HistoryState } from "./history-state";

export interface DiagramStateContext {
    state: HistoryState<DiagramState>;
    setState: Dispatch<SetStateAction<HistoryState<DiagramState>>>;
    model: DisplayModel;
    progress: Progress;
}

const state = HistoryState.init<DiagramState>({
    wordOrder: [],
    elements: {}
});
const model = DisplayModel.init(state.currState);
const progress: Progress = {
    partOfSpeech: {
        percentage: 0,
        errorItems: []
    },
    phraseAndClause: {
        percentage: 0,
        errorItems: []
    }
};
export const DiagramStateContext = createContext<DiagramStateContext>({
    state: state,
    model: model,
    progress: progress,
    setState: () => { throw "not implemented"; }
});