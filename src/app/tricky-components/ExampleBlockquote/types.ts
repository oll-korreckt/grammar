import { LabelSettings, Lexeme } from "@app/tricky-components/LabelView";
import { ElementCategory, ElementId } from "@domain/language";
import { HTMLBlockquoteObject } from "@lib/utils";
import { Model } from "@utils/model";
import React from "react";

export interface ExampleBlockquoteProps {
    blockquote: HTMLBlockquoteObject;
}

export interface MasterState {
    type: StateType;
    bqObj: HTMLBlockquoteObject;
    model?: Model;
    lexemes?: Lexeme[];
    labelSettings?: Record<ElementId, LabelSettings>;
    showReset?: boolean;
    category?: ElementCategory;
    selectedElement?: ElementId;
}

export type MasterAction = {
    type: "loading: data fetched";
    data: Model;
} | {
    type: "loading: fetch error";
}

export type ViewAction = {
    type: "closed: open model";
} | {
    type: "open: close model";
} | {
    type: "open: reset view";
} | {
    type: "open: up level";
} | {
    type: "open: category select";
    category: ElementCategory;
} | {
    type: "open: element select";
    id: ElementId;
} | {
    type: "error: retry";
} | {
    type: "error: cancel";
}

export interface OpenState {
    type: "open";
    children?: Lexeme[];
    settings?: Record<ElementId, LabelSettings>;
    showReset?: boolean;
    showUpLevel?: boolean;
    category?: ElementCategory;
    selectedElement?: ElementId;
}

export interface ClosedState {
    type: "closed";
    children?: HTMLBlockquoteObject;
}

export interface LoadingState {
    type: "loading";
    children?: HTMLBlockquoteObject;
}

export interface ErrorState {
    type: "error";
}

export type StateType =
    | "open"
    | "loading"
    | "closed"
    | "error"

export type ViewState =
    | OpenState
    | ClosedState
    | LoadingState
    | ErrorState;
export type ExampleBlockquoteViewContext = ViewState;

export const ExampleBlockquoteViewContext = React.createContext<ExampleBlockquoteViewContext>({
    type: "error"
});