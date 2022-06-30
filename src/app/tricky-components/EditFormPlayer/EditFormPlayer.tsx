import { accessClassName, ControlAnimationContext, DisplayModeContext } from "@app/utils";
import { Frame } from "@utils/frame";
import React, { useEffect, useReducer } from "react";
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

interface State {
    index: number;
    showAnimatingElement: boolean;
}

type Action = {
    type: "increment";
    numFrames: number;
    showAnimatingElement: boolean;
} | {
    type: "update animating element";
    showAnimatingElement: boolean;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "increment": {
            const newIndex = state.index === action.numFrames - 1
                ? 0
                : state.index + 1;
            return {
                index: newIndex,
                showAnimatingElement: action.showAnimatingElement
            };
        }
        case "update animating element": {
            return {
                index: state.index,
                showAnimatingElement: action.showAnimatingElement
            };
        }
    }
}

const FrameRunner: React.VFC<FrameRunnerProps> = ({ children }) => {
    const [{ index, showAnimatingElement }, dispatch] = useReducer(reducer, { index: 0, showAnimatingElement: false });

    useEffect(() => {
        const { duration, animatingElement } = children[index];
        const defDuration = duration ? duration : 2;
        if (animatingElement) {
            const waitTime = 1.0;
            setTimeout(() => {
                dispatch({
                    type: "update animating element",
                    showAnimatingElement: true
                });
                setTimeout(() => {
                    dispatch({
                        type: "increment",
                        numFrames: children.length,
                        showAnimatingElement: false
                    });
                }, (defDuration - waitTime) * 1000);
            }, waitTime * 1000);
        } else {
            setTimeout(() => {
                dispatch({
                    type: "increment",
                    numFrames: children.length,
                    showAnimatingElement: false
                });
            }, defDuration * 1000);
        }
    }, [index, children]);

    const { data, animatingElement } = children[index];
    const activeElement = showAnimatingElement ? animatingElement : undefined;

    return (
        <DisplayModeContext.Provider value={{ displayMode: "partial" }}>
            <ControlAnimationContext.Provider value={{ activeElement }}>
                <EditFormFrameRender {...data}/>
            </ControlAnimationContext.Provider>
        </DisplayModeContext.Provider>
    );
};