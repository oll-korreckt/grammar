export type EditActiveMenuAction = {
    type: "property select";
    property: string;
} | {
    type: "property delete";
    property: string;
} | {
    type: "exit edit";
} | {
    type: "close";
} | {
    type: "submit";
}

export interface PropertyState {
    propertyKey: string;
    order: number;
    displayName?: string;
    required?: boolean | undefined;
    satisfied?: boolean | undefined;
}

export type EditActiveMenuDispatch = (action: EditActiveMenuAction) => void;