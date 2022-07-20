import { accessClassName } from "@app/utils";
import { withClassName, withClassNameProp } from "@app/utils/hoc";
import { scan } from "@domain/language";
import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { ErrorList, ErrorListItem } from "../ErrorList";
import { TextEditor } from "../TextEditor";
import styles from "./_styles.module.scss";

export interface InputFormProps {
    initialValue?: string;
    onStateChange?: (state: InputFormState) => void;
}

export interface InputFormState {
    value: string;
    errorState: InputFormErrorState;
}

export type InputFormErrorState = "none" | "errors" | "calculating";

interface Error {
    position: [line: number, column: number];
    msg: string;
}

interface State {
    input: string;
    errors: Error[];
    lastChange?: "input" | "error";
}

type Action = {
    type: "update input";
    input: string;
}

function getErrors(input: string): Error[] {
    const output: Error[] = [];
    const lines = input.split("\n");
    lines.forEach((line, lineNum) => {
        const scanResult = scan(line);
        if (scanResult.type === "errors") {
            scanResult.data.forEach(({ message, start }) => {
                output.push({
                    position: [lineNum, start],
                    msg: message
                });
            });
        }
    });
    return output;
}

function reducer(state: State, action: Action): State {
    const errors = getErrors(action.input);
    return {
        input: action.input,
        errors
    };
}

function initializer(initialValue: string | undefined): State {
    const defInitialValue = initialValue !== undefined ? initialValue : "";
    const errors = getErrors(defInitialValue);
    return {
        input: defInitialValue,
        errors
    };
}

function cursorToKey([line, col]: [number, number]): string {
    return `${line}.${col}`;
}

function keyToCursor(key: string): [number, number] {
    const [line, col] = key.split(".");
    return [parseInt(line), parseInt(col)];
}

export const InputForm: React.VFC<InputFormProps> = ({ initialValue, onStateChange }) => {
    const [state, dispatch] = useReducer(reducer, initialValue, initializer);
    const stateChangeRef = useRef(false);
    const [errorListAnimate, setErrorListAnimate] = useState(false);
    const [cursorPos, setCursorPos] = useState<[number, number]>();

    const extendedDispatch: React.Dispatch<Action> = (action) => {
        stateChangeRef.current = true;
        dispatch(action);
    };

    useLayoutEffect(() => setErrorListAnimate(true), []);

    const errListItems: ErrorListItem[] = state.errors.map(({ msg, position }) => {
        const [line, col] = position;
        return {
            key: cursorToKey(position),
            message: `[${line + 1}, ${col + 1}]: ${msg}`
        };
    });

    useEffect(() => {
        // clear cursorPos each time it gets set
        if (cursorPos !== undefined) {
            setCursorPos(undefined);
        }
    }, [cursorPos]);

    useEffect(() => {
        if (!stateChangeRef.current) {
            return;
        }
        stateChangeRef.current = false;
        if (onStateChange) {
            onStateChange({
                value: state.input,
                errorState: state.errors.length > 0 ? "errors" : "none"
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateChangeRef.current, onStateChange, state.input, state.errors.length]);

    return (
        <div className={accessClassName(styles, "inputForm")}>
            <ExtendedTextEditor
                onInputChange={(input) => extendedDispatch({ type: "update input", input })}
                errors={state.errors.length > 0}
                cursorPosition={cursorPos}
            >
                {state.input}
            </ExtendedTextEditor>
            <ExtendedErrorList
                className={accessClassName(styles, "extendedErrorList")}
                onItemSelect={(key) => setCursorPos(keyToCursor(key))}
                showAnimation={errorListAnimate}
            >
                {errListItems}
            </ExtendedErrorList>
        </div>
    );
};

const ExtendedTextEditor = withClassName(TextEditor, accessClassName(styles, "extendedTextEditor"));
const ExtendedErrorList = withClassNameProp(ErrorList);