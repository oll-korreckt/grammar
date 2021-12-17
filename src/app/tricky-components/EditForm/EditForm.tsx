import { EditNavBar } from "@app/basic-components/EditNavBar";
import { Stage } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import { AnimatePresence, motion, Transition } from "framer-motion";
import React, { useReducer, useRef } from "react";
import { SentenceInput, SentenceInputErrorState } from "../SentenceInput";

export interface EditFormProps {
    initialValue?: string;
}

interface State {
    activeStage: Stage;
    inputState: InputState;
}

interface InputState {
    input: string;
    errorState: SentenceInputErrorState;
}

type Action = {
    type: "switch";
    stage: Stage;
} | ({
    type: "sentence input state";
} & InputState)

type EnableStages = ["input"] | ["input", "label"];

function useEnableStages(input: string, errorState: SentenceInputErrorState): EnableStages {
    const prevOutput = useRef<EnableStages>();
    let output: EnableStages;
    if (input === "") {
        output = ["input"];
    } else {
        switch (errorState) {
            case "calculating":
                if (prevOutput.current === undefined) {
                    throw "cannot start with calculating state";
                }
                output = prevOutput.current;
                break;
            case "none":
                output = ["input", "label"];
                break;
            case "errors":
                output = ["input"];
                break;
        }
    }
    prevOutput.current = output;
    return output;
}

function checkInputState({ errorState }: InputState): boolean {
    return errorState === "none";
}

function handleSwitch(state: State, targetStage: Stage): State {
    const switchState: State = {
        ...state,
        activeStage: targetStage
    };
    return state.activeStage === "input"
        ? checkInputState(state.inputState)
            ? switchState
            : state
        : switchState;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "switch":
            return handleSwitch(state, action.stage);
        case "sentence input state":
            return {
                ...state,
                inputState: {
                    input: action.input,
                    errorState: action.errorState
                }
            };
    }
    throw "unhandled action";
}

const transition: Transition = { duration: 0.3 };

export const EditForm: React.VFC<EditFormProps> = ({ initialValue }) => {
    const [state, dispatch] = useReducer(
        reducer,
        {
            activeStage: "input",
            inputState: {
                input: initialValue !== undefined ? initialValue : "",
                errorState: "none"
            }
        }
    );
    const { activeStage, inputState } = state;
    const enableStages = useEnableStages(
        inputState.input,
        inputState.errorState
    );

    return (
        <>
            <ExtendedEditNavBar
                stage={activeStage}
                enabledStages={enableStages}
                onStageClick={(stage) => dispatch({ type: "switch", stage })}
            />
            <div>
                <AnimatePresence
                    initial={false}
                >
                    {activeStage === "input" &&
                        <motion.div
                            key="input"
                            initial={{ x: "-100vw" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100vw" }}
                            transition={transition}
                            style={{
                                position: "absolute",
                                width: "100vw",
                                height: "100vh"
                            }}
                        >
                            <SentenceInput
                                onStateChange={(newState) => {
                                    dispatch({
                                        type: "sentence input state",
                                        input: newState.value,
                                        errorState: newState.errorState
                                    });
                                }}
                                initialValue={inputState.input}
                            />
                        </motion.div>
                    }
                    {activeStage === "label" &&
                        <motion.div
                            key="label"
                            initial={{ x: "100vw" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100vw" }}
                            transition={transition}
                            style={{
                                position: "absolute",
                                width: "100vw",
                                height: "100vh",
                                backgroundColor: "red"
                            }}
                        >
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </>
    );
};

const ExtendedEditNavBar = withClassNameProp(EditNavBar);