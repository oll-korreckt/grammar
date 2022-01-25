import { DiagramState, LabelFormMode } from "@app/utils";
import { ElementCategory, ElementId, ElementType } from "@domain/language";

const navigateMode: LabelFormMode = "navigate";
const addMode: LabelFormMode = "add";
const editBrowseMode: LabelFormMode = "edit.browse";
const editActiveMode: LabelFormMode = "edit.active";
const deleteMode: LabelFormMode = "delete";

interface StateBase {
    display: DisplaySettings;
    diagram: DiagramState;
}

export type State =
    | NavigateState
    | AddState
    | EditBrowseState
    | EditActiveState
    | DeleteState;

export interface NavigateState extends StateBase {
    mode: typeof navigateMode;
}

export interface AddState extends StateBase {
    mode: typeof addMode;
}

export interface EditBrowseState extends StateBase {
    mode: typeof editBrowseMode;
}

export interface EditActiveState extends StateBase {
    mode: typeof editActiveMode;
    id: ElementId;
    property?: string;
    priorMode?: AddState | EditBrowseState;
}

export interface DeleteState extends StateBase {
    mode: typeof deleteMode;
}


export interface DisplaySettings {
    category?: ElementCategory;
    expanded?: ElementId;
}

export type DiagramChange = (newDiagram: DiagramState) => void;

export interface LabelFormProps {
    initialDiagram?: DiagramState;
    initialMode?: LabelFormMode;
    initialDisplay?: DisplaySettings;
    onDiagramChange?: DiagramChange;
}

export type LabelFormAction = {
    type: "switch mode";
    target: Exclude<LabelFormMode, "edit.active">;
} | {
    type: "navigate: category";
    category: ElementCategory;
} | {
    type: "navigate: expanded";
    expanded: ElementId | undefined;
} | {
    type: "navigate: up";
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
    property: string;
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
    target: Exclude<LabelFormMode, "edit.active">;
} | {
    type: "delete: element";
    id: ElementId;
} | {
    type: "delete: all";
}