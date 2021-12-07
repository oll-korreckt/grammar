import { BaseEditor, BaseRange, NodeEntry, Text, Node } from "slate";
import { ReactEditor } from "slate-react";

export interface ParagraphElement {
    type: "paragraph";
    children: (CustomText | ErrorElement)[];
}

export type TokenType = "error";

export interface PlainText {
    text: string;
    bold?: boolean | undefined;
}

interface Token extends PlainText {
    tokenType: TokenType;
}

export interface ErrorToken extends Token {
    tokenType: "error";
    key: string;
    message: string;
}

function isPlainText(value: any): value is PlainText {
    return Text.isText(value);
}

function isToken(value: any): value is Token {
    return Text.isText(value) && "tokenType" in value;
}

export function isErrorToken(value: any): value is ErrorToken {
    return isToken(value) && value.tokenType === "error";
}

export type TextType = {
    type: "plainText";
    data: PlainText;
} | {
    type: "errorToken";
    data: ErrorToken;
}

export function getTextType(text: CustomText): TextType {
    if (isErrorToken(text)) {
        return { type: "errorToken", data: text };
    } else if (isPlainText(text)) {
        return { type: "plainText", data: text };
    }
}

export type CustomElement = ParagraphElement;
export type CustomText = PlainText | ErrorToken;
export type DecoratorRange = Omit<ErrorToken, "text"> & BaseRange;
export type Decorator = (entry: NodeEntry<Node>) => DecoratorRange[];

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}