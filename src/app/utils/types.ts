import { ElementId, ElementMapper, ElementType, Identifiable } from "@domain/language";

export type ElementFilterType = "word" | "partOfSpeech" | "phrase" | "clause" | "sentence";

export type DiagramStateItem = {
    value: Identifiable;
    type: ElementType;
    refs: ElementId[];
}

export type TypedDiagramStateItem<T extends ElementType> = {
    value: ElementMapper<T>;
    type: T;
    refs: ElementId[];
}

export type DiagramState = {
    wordOrder: ElementId[];
    elements: {
        [key: string]: DiagramStateItem;
    };
}
