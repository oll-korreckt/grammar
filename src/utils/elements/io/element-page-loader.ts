import { HTMLObject, MarkdownToken, ParseObject } from "@lib/utils";
import { MarkdownCompiler } from "@lib/utils/markdown-compiler";
import { MarkdownParser } from "@lib/utils/markdown-parser";
import { MarkdownScanner } from "@lib/utils/markdown-scanner";
import { promises as fs } from "fs";
import { ElementPage, ElementPageType, Preprocessor } from "..";
import { MarkdownFinder } from "./markdown-finder";


async function loadPage(pageType: ElementPageType): Promise<HTMLObject | HTMLObject[]> {
    const tokens = await getTokens(pageType);
    if (tokens.length === 0) {
        return [];
    }
    let parseOutput = MarkdownParser.parse(tokens);
    if (ElementPage.isElementType(pageType)) {
        parseOutput = Preprocessor.runElementType(pageType, parseOutput);
    } else if (ElementPage.isElementCategory(pageType)) {
        parseOutput = Preprocessor.runElementCategory(pageType, parseOutput);
    } else {
        throw `Unrecognized page type '${pageType}'`;
    }
    const htmlObjs = MarkdownCompiler.compile(parseOutput);
    return htmlObjs;
}

async function loadInfo(pageType: ElementPageType): Promise<HTMLObject | HTMLObject[]> {
    const tokens = await getTokens(pageType);
    const parseObjects = MarkdownParser.parse(tokens);
    const compileTarget: ParseObject[] = [];
    for (let index = 0; index < parseObjects.length; index++) {
        const obj = parseObjects[index];
        if (obj.type === "snippet" && obj.name === pageType) {
            compileTarget.push(obj);
            break;
        }
    }
    if (compileTarget.length !== 1) {
        throw `No info section found for '${pageType}'`;
    }
    const htmlObjs = MarkdownCompiler.compile(compileTarget);
    return htmlObjs;
}

async function getTokens(pageType: ElementPageType): Promise<MarkdownToken[]> {
    const filepath = MarkdownFinder.findFile(pageType);
    const fileBuffer = await fs.readFile(filepath);
    const tokens = MarkdownScanner.scan(fileBuffer.toString());
    return tokens;
}

export const ElementPageLoader = {
    loadPage: loadPage,
    loadInfo: loadInfo
};