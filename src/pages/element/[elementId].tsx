import { Anchor, GenericHTMLObjectComponent, HTMLObjectRender, TableData } from "@app/basic-components/HTMLObjectRender";
import { HTMLObject } from "@lib/utils";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import React from "react";
import { promises as fs } from "fs";
import { MarkdownScanner } from "@lib/utils/markdown-scanner";
import { MarkdownParser } from "@lib/utils/markdown-parser";
import { MarkdownCompiler } from "@lib/utils/markdown-compiler";
import { Preprocessor } from "utils/elements";
import styles from "./_styles.module.scss";
import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { ElementType } from "@domain/language";
import Link from "next/link";
import { ElementPageType } from "utils/elements/types";
import { MarkdownFinder } from "utils/elements/markdown-finder";
import { ElementTable } from "utils/elements/element-table";

export interface ElementPageProps {
    type: Exclude<ElementType, "word">;
    content: HTMLObject | HTMLObject[];
}


const ElementPage: NextPage<ElementPageProps> = ({ type, content }) => {
    const CustomTd = createCustomTd(type);
    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "content")}>
                <HTMLObjectRender
                    aProps={(obj) => {
                        if (ElementTable.isTypeLink(obj)) {
                            return { className: accessClassName(styles, "typeLink") };
                        }
                    }}
                    aCmpt={CustomAnchor}
                    tdCmpt={CustomTd}
                >
                    {content}
                </HTMLObjectRender>
            </div>
        </div>
    );
};

function createCustomTd(type: Exclude<ElementType, "word">): GenericHTMLObjectComponent<"td"> {
    const CustomTd: GenericHTMLObjectComponent<"td"> = (props) => {
        const { children, ...rest } = props;
        if (children.custom === "color") {
            const color = ElementDisplayInfo.getDisplayInfo(type).color;
            return (
                <td {...rest}>
                    <div className={accessClassName(styles, color)}/>
                </td>
            );
        }
        return <TableData {...props}/>;
    };
    return CustomTd;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomAnchor: GenericHTMLObjectComponent<"a"> = ({ children, href, ...rest }) => {
    if (href === undefined) {
        throw "";
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
    elementId: string;
}

export const getStaticPaths: GetStaticPaths<PathData> = async () => {
    return {
        paths: [
            { params: { elementId: "verb-phrase" } }
        ],
        fallback: false
    };
};

export const getStaticProps: GetStaticProps<ElementPageProps, PathData> = async ({ params }) => {
    if (params === undefined) {
        throw "params does not exist";
    }
    const { elementId } = params;
    const type = ElementPageType.idToPageType(elementId);
    const filepath = MarkdownFinder.findFile(type);
    const fileBuffer = await fs.readFile(filepath);
    const fileContent = await fileBuffer.toString();
    const tokens = MarkdownScanner.scan(fileContent);
    const parseOutput = MarkdownParser.parse(tokens);
    if (!ElementType.isElementType(type) || type === "word") {
        throw "";
    }
    const parsedParseOutput = Preprocessor.run(type, parseOutput);
    const htmlObjs = MarkdownCompiler.compile(parsedParseOutput);
    return {
        props: {
            type: type,
            content: htmlObjs
        }
    };
};

export default ElementPage;