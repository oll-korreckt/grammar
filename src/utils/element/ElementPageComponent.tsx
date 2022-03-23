import { Anchor, GenericHTMLObjectComponent, HTMLObjectRender, TableData } from "@app/basic-components/HTMLObjectRender";
import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { HTMLObject } from "@lib/utils";
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
    const CustomAnchor = createCustomAnchor(type);
    const CustomTd = ElementPage.isElementType(type)
        ? createElementPageTd(type)
        : undefined;
    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "content")}>
                <HTMLObjectRender
                    aCmpt={CustomAnchor}
                    tdCmpt={CustomTd}
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

function createCustomAnchor(type: MarkdownPageType): GenericHTMLObjectComponent<"a"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const CustomAnchor: GenericHTMLObjectComponent<"a"> = ({ children, href, ...rest }) => {
        if (href === undefined) {
            throw "";
        }
        if (!ElementPage.isPageId(href)) {
            throw `'${href}' is not a valid elementpage`;
        }
        let modifiedHref: string = href;
        if (type === "index") {
            modifiedHref = `element/${modifiedHref}`;
        }
        return (
            <Link href={modifiedHref} passHref>
                <Anchor {...rest}>
                    {children}
                </Anchor>
            </Link>
        );
    };
    return CustomAnchor;
}