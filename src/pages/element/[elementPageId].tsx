import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { ElementPage, ElementPageId, MarkdownPageType, ElementPageComponent, ElementPageComponentProps } from "utils/element";
import { ElementPageLoader } from "utils/element/io";

interface PathData extends ParsedUrlQuery {
    elementPageId: ElementPageId;
}

export const getStaticPaths: GetStaticPaths<PathData> = async () => {
    return {
        paths: ElementPage.getAllPageIds().filter((id) => id !== "word").map((id) => {
            return { params: { elementPageId: id } };
        }),
        fallback: false
    };
};

export const getStaticProps: GetStaticProps<ElementPageComponentProps, PathData> = async ({ params }) => {
    if (params === undefined) {
        throw "params does not exist";
    }
    const { elementPageId } = params;
    const pageType: MarkdownPageType = ElementPage.idToType(elementPageId);
    const content = await ElementPageLoader.loadPage(pageType);
    return {
        props: {
            type: pageType,
            content
        }
    };
};

export default ElementPageComponent;