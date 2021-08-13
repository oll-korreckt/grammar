import { createContext } from "react";
import { DiagramState } from "./diagram-state";
import { DisplayModel, Progress } from "./display-model";

export interface DiagramStateContext {
    state: DiagramState;
    model: DisplayModel;
    progress: Progress;
}

const state = {
    wordOrder: [],
    elements: {}
};
const model = DisplayModel.init(state);
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
    progress: progress
});