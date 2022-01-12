import { DiagramState, WordViewMode } from "@app/utils";
import { ElementCategory, ElementId, ElementType } from "@domain/language";
import { AddMenuProps } from "../AddMenu";

const navigateMode: WordViewMode = "navigate";
const addMode: WordViewMode = "add";
const editBrowseMode: WordViewMode = "edit.browse";
const editActiveMode: WordViewMode = "edit.active";
const deleteMode: WordViewMode = "delete";

export type State = {
    display: DisplaySettings;
    diagram: DiagramState;
} & (
    | NavigateState
    | AddState
    | EditBrowseState
    | EditActiveState
    | DeleteState
);

interface NavigateState {
    mode: typeof navigateMode;
}

interface AddState extends Required<Pick<AddMenuProps, "menuItems" | "selectedItem">> {
    mode: typeof addMode;
}

interface EditBrowseState {
    mode: typeof editBrowseMode;
}

interface EditActiveState {
    mode: typeof editActiveMode;
    id: ElementId;
    priorMode: { diagram: DiagramState; } & (AddState | EditBrowseState);
}

interface DeleteState {
    mode: typeof deleteMode;
}


export interface DisplaySettings {
    category?: ElementCategory;
    expanded?: ElementId;
}

export type WordViewAssemblyAction = {
    type: "switch mode";
    target: Exclude<WordViewMode, "edit.active">;
} | {
    type: "navigate: category";
    category: ElementCategory;
} | {
    type: "navigate: expanded";
    expanded: ElementId | undefined;
} | {
    type: "add: edit.active";
    elementType: Exclude<ElementType, "word">;
} | {
    type: "edit.browse: edit.active";
    id: ElementId;
} | {
    type: "edit.active: submit";
} | {
    type: "edit.active: cancel";
} | {
    type: "edit.active: delete property";
} | {
    type: "edit.active: edit property";
    property: string | undefined;
} | {
    type: "edit.active: add reference";
    property: string;
    id: ElementId;
} | {
    type: "edit.active: remove reference";
    property: string;
    id: ElementId;
} | {
    type: "edit.active: switch mode";
    target: Exclude<WordViewMode, "edit.active">;
} | {
    type: "delete: element";
    id: ElementId;
} | {
    type: "delete: all";
}