import { HTMLObject, HTMLObjectMap, HTMLObjectType } from "@lib/utils";
import React, { createContext } from "react";

export type ClassMap = (className: string | string[]) => string | undefined | void;

export type HTMLObjectRenderProps =
    & ElementRenderProps<"blockquote">
    & ElementRenderProps<"br">
    & ElementRenderProps<"code">
    & ElementRenderProps<"del">
    & ElementRenderProps<"i">
    & ElementRenderProps<"h1">
    & ElementRenderProps<"h2">
    & ElementRenderProps<"h3">
    & ElementRenderProps<"h4">
    & ElementRenderProps<"h5">
    & ElementRenderProps<"h6">
    & ElementRenderProps<"hr">
    & ElementRenderProps<"img">
    & ElementRenderProps<"a">
    & ElementRenderProps<"table">
    & ElementRenderProps<"thead">
    & ElementRenderProps<"tbody">
    & ElementRenderProps<"tr">
    & ElementRenderProps<"th">
    & ElementRenderProps<"td">
    & ElementRenderProps<"ol">
    & ElementRenderProps<"ul">
    & ElementRenderProps<"tasklist">
    & ElementRenderProps<"li">
    & ElementRenderProps<"p">
    & ElementRenderProps<"b">
    & ElementRenderProps<"checkbox">
    & {
        classMap?: ClassMap;
        children?: HTMLObject | HTMLObject[];
    };

type ElementRenderProps<Type extends HTMLObjectType = HTMLObjectType> = {
    [Key in `${Type}Props`]?: GenericElementPropsGetter<Type>;
} & {
    [Key in `${Type}Cmpt`]?: React.VFC<HTMLObjectComponentProps<Type>>;
}

export type GenericElementPropsGetter<Type extends HTMLObjectType> =
    | Partial<HTMLObjectComponentProps<Type>>
    | GenericElementPropsGetterFunction<Type>

export type ElementPropsGetter =
    | Record<string, any>
    | ((htmlObj: HTMLObject) => void | undefined | Record<string, any>);

type GenericElementPropsGetterFunction<THTMLObject extends HTMLObjectType> = (htmlObj: HTMLObjectMap<THTMLObject>) => void | undefined | Partial<HTMLObjectComponentProps<THTMLObject>>;

export type HTMLObjectTagMap<Type extends HTMLObjectType> = _HTMLObjectTagMap[Type];
type _HTMLObjectTagMap = {
    blockquote: "blockquote";
    br: "br";
    code: "code";
    del: "del";
    i: "i";
    h1: "h1";
    h2: "h2";
    h3: "h3";
    h4: "h4";
    h5: "h5";
    h6: "h6";
    hr: "hr";
    img: "img";
    a: "a";
    table: "table";
    thead: "thead";
    tbody: "tbody";
    tr: "tr";
    th: "th";
    td: "td";
    ol: "ol";
    ul: "ul";
    tasklist: "ul";
    li: "li";
    p: "p";
    b: "b";
    checkbox: "input";
};

type InputType = "checkbox";
type InputRenderProps<TInputType extends InputType> =
    Omit<JSX.IntrinsicElements["input"], "children" | "ref" | "type">
    & {
        type: TInputType;
        ref?: ModernRef<TInputType>;
        children: HTMLObjectMap<TInputType>;
    };
type ModernRef<Type extends HTMLObjectType> = Exclude<JSX.IntrinsicElements[HTMLObjectTagMap<Type>]["ref"], string>;
type StandardRenderProps<Type extends HTMLObjectType> =
    Omit<JSX.IntrinsicElements[HTMLObjectTagMap<Type>], "children" | "ref">
    & {
        ref?: ModernRef<Type>;
        children: HTMLObjectMap<Type>;
    };

export type HTMLObjectComponentProps<Type extends HTMLObjectType> = Type extends InputType
    ? InputRenderProps<Type>
    : StandardRenderProps<Type>;
export type GenericHTMLObjectComponent<Type extends HTMLObjectType> = React.VFC<HTMLObjectComponentProps<Type>>;
export type HTMLObjectComponent = React.VFC<Record<string, any>>;

export type HTMLObjectRenderContext = Omit<HTMLObjectRenderProps, "children">;
export const HTMLObjectRenderContext = createContext<HTMLObjectRenderContext>({});