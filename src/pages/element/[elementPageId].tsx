import { Anchor, GenericHTMLObjectComponent, HTMLObjectRender, TableData } from "@app/basic-components/HTMLObjectRender";
import { HTMLObject } from "@lib/utils";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import styles from "./_styles.module.scss";
import { accessClassName, ElementDisplayInfo } from "@app/utils";
import Link from "next/link";
import { ElementPage, ElementPageId, ElementPageType, ElementPageType_ElementType } from "utils/elements";
import { ElementPageLoader } from "utils/elements/io";

export interface ElementPageProps {
    type: ElementPageType;
    content: HTMLObject | HTMLObject[];
}


const ElementPageComponent: NextPage<ElementPageProps> = ({ type, content }) => {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomAnchor: GenericHTMLObjectComponent<"a"> = ({ children, href, ...rest }) => {
    if (href === undefined) {
        throw "";
    }
    if (!ElementPage.isPageId(href)) {
        throw `'${href}' is not a valid elementpage`;
    }
    return (
        <Link href={href} passHref>
            <Anchor {...rest}>
                {children}
            </Anchor>
        </Link>
    );
};

interface PathData extends ParsedUrlQuery {
    elementPageId: ElementPageId;
}

export const getStaticPaths: GetStaticPaths<PathData> = async () => {
    return {
        paths: [
            { params: { elementPageId: "adjective" } },
            { params: { elementPageId: "adverb" } },
            { params: { elementPageId: "verb-phrase" } }
        ],
        fallback: false
    };
};

export const getStaticProps: GetStaticProps<ElementPageProps, PathData> = async ({ params }) => {
    if (params === undefined) {
        throw "params does not exist";
    }
    const { elementPageId } = params;
    const elementPageType = ElementPage.idToType(elementPageId);
    const content = await ElementPageLoader.loadPage(elementPageType);
    return {
        props: {
            type: elementPageType,
            content
        }
    };
};

export default ElementPageComponent;