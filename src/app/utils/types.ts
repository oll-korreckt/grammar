import { LabelSettings, Lexeme } from "@app/tricky-components/LabelView";
import { ElementCategory, ElementType } from "@domain/language";
import { Variant } from "framer-motion";
import React from "react";
import {
    Element as SlateElement,
    Text as SlateText
} from "slate";
import { EditableProps, RenderElementProps, RenderLeafProps } from "slate-react/dist/components/editable";

export type ElementFilterType = "word" | "partOfSpeech" | "phrase" | "clause" | "sentence";
export type SimpleComponentProps = { children: string; }
export type SimpleComponent = React.FC<SimpleComponentProps>;
export type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
}

export type PartialRect = Pick<Rect, "width" | "height">;

function init(domRect: DOMRect): Rect {
    return {
        top: domRect.top,
        left: domRect.left,
        width: domRect.width,
        height: domRect.height
    };
}

export const Rect = {
    init: init
};

export type ChildVariants = {
    hidden?: Variant;
    show?: Variant;
    exit?: Variant;
}

export type LabelFormMode =
    | "navigate"
    | "add"
    | "edit.browse"
    | "edit.active"
    | "delete";

export const LabelFormMode = {
    getDefault(mode?: LabelFormMode): LabelFormMode {
        return mode !== undefined ? mode : "navigate";
    }
};

export const EVENTS = {
    initial: "hidden",
    animate: "show",
    exit: "exit"
};

type EditableProp<Key extends keyof EditableProps> = Exclude<EditableProps[Key], undefined>;
export type RenderElement = EditableProp<"renderElement">;
export type RenderLeaf = EditableProp<"renderLeaf">;
export type Decorate = EditableProp<"decorate">;
export interface TypedRenderElementProps<TElement extends SlateElement = SlateElement> extends RenderElementProps {
    element: TElement;
}
export type TypedRenderElement<TElement extends SlateElement = SlateElement> = (props: TypedRenderElementProps<TElement>) => JSX.Element;
export interface TypedRenderLeafProps<TLeaf extends SlateText = SlateText> extends RenderLeafProps {
    leaf: TLeaf;
}
export type TypedRenderLeaf<TLeaf extends SlateText = SlateText> = (props: TypedRenderLeafProps<TLeaf>) => JSX.Element;
export type Stage = "input" | "label";

export interface InputFrameRenderState {
    type: "input";
    disableLabelMode?: boolean;
    inputText?: string;
    showErrors?: boolean;
}
export interface NavigateMenuState {
    mode: "navigate";
    category?: ElementCategory;
    enableUpLevel?: boolean;
}
export interface AddMenuState {
    mode: "add";
    category?: "category" | "phrase" | "clause" | "coordinated" | "sentence";
    elements?: Exclude<ElementType, "word">[];
}
export interface PropertyDisplayState {
    propertyKey: string;
    order: number;
    required?: boolean;
    satisfied?: boolean;
}
export type EditActiveState =
    | EditActiveDisplay
    | EditActiveEdit
interface EditActiveBase {
    mode: "edit.active";
    elementType?: ElementType;
    allowSubmit?: boolean;
}
interface EditActiveDisplay extends EditActiveBase {
    editState: "display";
    assigned: PropertyDisplayState[];
    unassigned: PropertyDisplayState[];
}
interface EditActiveEdit extends EditActiveBase {
    editState: "edit";
    property: PropertyDisplayState;
}
function isDisplay(value: EditActiveState): value is EditActiveDisplay {
    return value.editState === "display";
}

function isEdit(value: EditActiveState): value is EditActiveEdit {
    return value.editState === "edit";
}

export const EditActiveState = {
    isDisplay,
    isEdit
};
export type LabelFrameRenderState = (
    | NavigateMenuState
    | AddMenuState
    | EditActiveState
) & {
    type: "label";
    labelSettings?: Record<string, LabelSettings>;
    lexemes?: Lexeme[];
}