import { createContext } from "react";
import { DiagramState } from "./diagram-state";
import { HistoryState } from "./history-state";

export interface DiagramStateContext {
    state: HistoryState<DiagramState>;
    setState: (newState: HistoryState<DiagramState>) => void;
}

export const DiagramStateContext = createContext<DiagramStateContext>({
    state: HistoryState.init({
        elements: {},
        wordOrder: []
    }),
    setState: () => { throw "not implemented"; }
});