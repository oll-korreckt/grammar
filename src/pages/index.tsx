import { useClientSide } from "@app/utils";
import { Frame } from "@utils/frame";
import { FrameError, FrameLoader } from "@utils/frame/io";
import { HomePage, HomePageProps } from "@utils/home";
import { GetStaticProps, NextPage } from "next";
import nodepath from "path";
import React from "react";

const Home: NextPage<HomePageProps> = ({ frames }) => {
    const client = useClientSide();
    return client
        ? <HomePage frames={frames}/>
        : null;
};

function createInputFrames(): Frame[] {
    const sentence = "The quick brown fox jumps over the lazy dog.";
    const output: Frame[] = [];
    for (let index = 0; index < sentence.length; index++) {
        const fragment = sentence.slice(0, index);
        output.push({
            duration: 0.08,
            data: {
                editMode: "input",
                inputText: fragment
            }
        });
    }
    return output;
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
    const loader = FrameLoader.createLoader(nodepath.resolve("src", "data", "frame"));
    const labelFrames = await loader.getFrames("player");
    if (FrameError.isFrameError(labelFrames)) {
        throw `The following error occurred while fetching data: '${labelFrames.msg}'`;
    }
    const inputFrames = createInputFrames();
    return {
        props: {
            frames: [...inputFrames, ...labelFrames]
        }
    };
};

export default Home;