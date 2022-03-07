import { HTMLObjectRender } from "@app/basic-components/HTMLObjectRender";
import { HTMLObject } from "@lib/utils";
import { GetStaticProps, NextPage } from "next";
import React from "react";
import { promises as fs } from "fs";
import { MarkdownScanner } from "@lib/utils/markdown-scanner";
import { MarkdownParser } from "@lib/utils/markdown-parser";
import { MarkdownCompiler } from "@lib/utils/markdown-compiler";
import { Preprocessor } from "utils/elements";
import styles from "./elements.module.scss";
import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { ElementTable } from "@app/utils/element-table";
import { ElementType } from "@domain/language";

export interface ElementPageProps {
    type: Exclude<ElementType, "word">;
    content: HTMLObject | HTMLObject[];
}


const ElementPage: NextPage<ElementPageProps> = ({ type, content }) => {
    return (
        <div className={accessClassName(styles, "hello")}>
            <div className={accessClassName(styles, "content")}>
                <HTMLObjectRender
                    anchorProps={(obj) => {
                        if (ElementTable.isTypeLink(obj)) {
                            return { className: accessClassName(styles, "typeLink") };
                        }
                    }}
                    tableDataProps={(obj) => {
                        if (obj.custom === "color") {
                            const color = ElementDisplayInfo.getDisplayInfo(type).color;
                            return { className: accessClassName(styles, color) };
                        }
                    }}
                >
                    {content}
                </HTMLObjectRender>
            </div>
        </div>
    );
};

export const getStaticProps: GetStaticProps<ElementPageProps> = async (context) => {
    const fileBuffer = await fs.readFile("/home/brick/Documents/repo/grammar/src/markdown/info/elements/phrase/verbPhrase.md");
    const fileContent = await fileBuffer.toString();
    const tokens = MarkdownScanner.scan(fileContent);
    const parseOutput = MarkdownParser.parse(tokens);
    const parsedParseOutput = Preprocessor.run("verbPhrase", parseOutput);
    const htmlObjs = MarkdownCompiler.compile(parsedParseOutput);
    return {
        props: {
            type: "verbPhrase",
            content: htmlObjs
        }
    };
};

export default ElementPage;