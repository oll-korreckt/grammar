import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export interface ParagraphElement {
    type: "paragraph";
    children: (CustomText | ErrorElement)[];
}

export interface ErrorElement {
    type: "error";
    children: CustomText[];
}

export interface CustomText {
    text: string;
}

export type CustomElement = ParagraphElement | ErrorElement;

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}