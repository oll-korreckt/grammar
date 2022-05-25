import { Anchor, Blockquote, GenericHTMLObjectComponent, HTMLObjectRender, TableData } from "@app/basic-components/HTMLObjectRender";
import { ExampleBlockquote } from "@app/tricky-components/ExampleBlockquote";
import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { HTMLBlockquoteObject, HTMLObject } from "@lib/utils";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import { ElementPage, ElementPageType_ElementType, MarkdownPageType } from "./types";
import styles from "./_styles.module.scss";

export interface ElementPageComponentProps {
    type: MarkdownPageType;
    content: HTMLObject | HTMLObject[];
}

export const ElementPageComponent: NextPage<ElementPageComponentProps> = ({ type, content }) => {
    const CustomTd = ElementPage.isElementType(type)
        ? createElementPageTd(type)
        : undefined;
    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "content")}>
                <HTMLObjectRender
                    aCmpt={CustomAnchor}
                    tdCmpt={CustomTd}
                    blockquoteCmpt={CustomBlockquote}
                    thProps={({ custom }) => {
                        if (custom) {
                            return {
                                title: custom,
                                style: {
                                    cursor: "help",
                                    textDecoration: "underline dotted"
                                }
                            };
                        }
                    }}
                    classMap={(className) => {
                        const classNameArr = Array.isArray(className)
                            ? className
                            : [className];
                        return accessClassName(styles, ...classNameArr);
                    }}
                >
                    {content}
                </HTMLObjectRender>
            </div>
        </div>
    );
};

function createElementPageTd(type: ElementPageType_ElementType): GenericHTMLObjectComponent<"td"> {
    const CustomTd: GenericHTMLObjectComponent<"td"> = (props) => {
        const { children, ...rest } = props;
        if (children.custom === "color") {
            const color = ElementDisplayInfo.getDisplayInfo(type).color;
            return (
                <td {...rest}>
                    <div className={accessClassName(styles, color)} />
                </td>
            );
        }
        return <TableData {...props} />;
    };
    return CustomTd;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomAnchor: GenericHTMLObjectComponent<"a"> = ({ children, href, ...rest }) => {
    if (href === undefined) {
        throw "anchor does not have an 'href' attribute";
    }
    if (!ElementPage.isPageId(href)) {
        throw `'${href}' is not a valid elementpage`;
    }
    const modifiedHref = `/element/${href}`;
    return (
        <Link href={modifiedHref} passHref>
            <Anchor {...rest}>
                {children}
            </Anchor>
        </Link>
    );
};

function convertCustom(custom: string): string {
    const customParts = custom.split(".");
    const errMsg = `Invalid custom property '${custom}'`;
    if (customParts.length !== 2) {
        throw errMsg;
    }
    const [pageType, name] = customParts;
    if (!ElementPage.isPageType(pageType)) {
        throw errMsg;
    }
    const pageId = ElementPage.typeToId(pageType);
    return `${pageId}.${name}`;
}

const CustomBlockquote: GenericHTMLObjectComponent<"blockquote"> = ({ children, ...rest }) => {
    if (children.custom) {
        const newCustom = convertCustom(children.custom);
        const newChildren: HTMLBlockquoteObject = {
            ...children,
            custom: newCustom
        };
        return (
            <ExampleBlockquote {...rest}>
                {newChildren}
            </ExampleBlockquote>
        );
    } else {
        return (
            <Blockquote {...rest}>
                {children}
            </Blockquote>
        );
    }
};