import { Variant } from "framer-motion";
import React from "react";
import { Element as SlateElement } from "slate";
import { EditableProps, RenderElementProps } from "slate-react/dist/components/editable";

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