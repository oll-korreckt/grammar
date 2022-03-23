import { GetStaticProps } from "next";
import { ElementPageComponent, ElementPageComponentProps } from "utils/elements";
import { ElementPageLoader } from "utils/elements/io";

export const getStaticProps: GetStaticProps<ElementPageComponentProps> = async () => {
    const content = await ElementPageLoader.loadPage("index");
    return {
        props: {
            type: "index",
            content
        }
    };
};

export default ElementPageComponent;