export type PropertyEditorAction = {
    type: "property select";
    property: PropertyState;
} | {
    type: "property cancel";
    property: PropertyState;
} | {
    type: "exit edit";
}

export type PropertyStatus = "assigned" | "unassigned" | "editing";

export interface PropertyState {
    propertyKey: string;
    order: number;
    displayName?: string;
    required?: boolean | undefined;
    satisfied?: boolean | undefined;
}

export type ActionDispatch = (action: PropertyEditorAction) => void;