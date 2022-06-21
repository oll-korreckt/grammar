import { accessClassName, ControlAnimationContext } from "@app/utils";
import { Frame } from "@utils/frame";
import React, { useEffect, useState } from "react";
import { EditFormFrameRender } from "../EditFormFrameRender";
import { QueryFunctionContext, useQuery } from "react-query";
import { SERVER } from "config";
import { HeapReducer } from "@lib/utils";
import styles from "./_styles.module.scss";

type EditFormPlayerKey = ["EditFormPlayer"];

function createInputFrames(): Frame[] {
    const sentence = "The quick brown fox jumps over the lazy dog.";
    const output: Frame[] = [{
        duration: 1,
        data: {
            editMode: "input",
            inputText: ""
        }
    }];
    for (let index = 1; index < sentence.length; index++) {
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

async function queryFn({}: QueryFunctionContext<EditFormPlayerKey>): Promise<Frame[]> {
    const queryStr = `${SERVER}/api/frame/player`;
    const response = await fetch(queryStr);
    if (!response.ok) {
        let errorMsg = "error occurred while loading frames for 'player'";
        try {
            errorMsg = await response.text();
        } catch {
        }
        throw errorMsg;
    }
    const inputFrames = createInputFrames();
    const labelFrames: Frame[] = await response.json();
    const output = [...inputFrames, ...labelFrames];
    return HeapReducer.run(output);
}

export const EditFormPlayer: React.VFC = () => {
    const key: EditFormPlayerKey = ["EditFormPlayer"];
    const query = useQuery(key, queryFn, { retry: false });

    const editFormPlayer = accessClassName(styles, "editFormPlayer");

    switch (query.status) {
        case "loading":
            return (
                <div className={editFormPlayer}>
                    <div className={accessClassName(styles, "loading")}></div>
                </div>
            );
        case "error":
            return null;
        case "success":
            return (
                <div className={editFormPlayer}>
                    <FrameRunner>
                        {query.data}
                    </FrameRunner>
                </div>
            );
        default:
            throw `Invalid status: '${query.status}'`;
    }
};

interface FrameRunnerProps {
    children: Frame[];
}

const FrameRunner: React.VFC<FrameRunnerProps> = ({ children }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const { duration } = children[index];
        const defDuration = duration ? duration : 2;
        const nextIndex = index === children.length - 1
            ? 0
            : index + 1;
        setTimeout(() => setIndex(nextIndex), defDuration * 1000);
    }, [index, children]);

    const { data, animatingElement } = children[index];

    return (
        <ControlAnimationContext.Provider value={{ activeElement: animatingElement }}>
            <EditFormFrameRender {...data}/>
        </ControlAnimationContext.Provider>
    );
};