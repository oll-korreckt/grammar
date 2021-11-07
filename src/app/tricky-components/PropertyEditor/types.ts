import { ElementDisplayInfo } from "@app/utils";
import { ElementType } from "@domain/language";
import { Variant, Variants } from "framer-motion";
import { createContext } from "react";

export type PropertyEditorAction = {
    type: "property edit";
    property: string;
} | {
    type: "property cancel";
    property: string;
} | {
    type: "exit edit";
}

export type ActionDispatch = (action: PropertyEditorAction) => void;

export function createInvoke(dispatch: ActionDispatch | undefined): ActionDispatch {
    return (action) => dispatch && dispatch(action);
}

export type PropertyData = ElementDisplayInfo["properties"][keyof ElementDisplayInfo["properties"]] & {
    key: string;
}

export const INVALID_PROPERTY = "$";

export interface PropertyContext {
    motionProperty: string;
}

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

export const DURATION = 0.6;

export interface AnimationContext {
    activeProperty?: string;
    firstMount: boolean;
}

export const AnimationContext = createContext<AnimationContext>({ firstMount: true });