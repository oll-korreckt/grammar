import { ElementId, ElementType } from "@domain/language";
import { createContext } from "react";
import { DisplayModel } from "./display-model";

export type FilterType = Extract<keyof DisplayModel, "word" | "partOfSpeech" | "phrase" | "clause">;
export type ElementSelectNode = {
    id: ElementId;
    type: ElementType;
    property?: string;
}

export interface DisplayModelContext {
    displayModel: DisplayModel;
    topFilter?: FilterType;
    setTopFilter: (filter: FilterType) => void;
    selectedItem?: ElementSelectNode[];
    setSelectedItem: (selectedItem: ElementSelectNode[] | undefined) => void;
}

export const DisplayModelContext = createContext<DisplayModelContext>({
    displayModel: {
        word: [],
        partOfSpeech: [],
        phrase: [],
        clause: [],
        elements: {}
    },
    setTopFilter: () => { throw "not implemented"; },
    setSelectedItem: () => { throw "not implemented"; }
});