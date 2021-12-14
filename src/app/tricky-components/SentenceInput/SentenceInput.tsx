import { accessClassName, DecoratorRange } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import React, { useMemo, useReducer, useRef, useState } from "react";
import { createEditor, Transforms } from "slate";
import { withReact } from "slate-react";
import { ErrorList, ErrorListItem } from "../ErrorList";
import { TextEditor } from "../TextEditor";
import styles from "./_styles.scss";

export interface SentenceInputProps {
    initialValue?: string;
    onStateChange?: (state: SentenceInputState) => void;
}

export interface SentenceInputState {
    value: string;
    errorState: ErrorState;
}

type ErrorState = "none" | "errors" | "calculating";

interface State {
    input: string;
    errors: DecoratorRange[];
    lastChange?: "input" | "error";
}

type Action = {
    type: "update input";
    input: string;
} | {
    type: "update errors";
    errors: DecoratorRange[];
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "update input":
            return {
                input: action.input,
                errors: state.errors,
                lastChange: "input"
            };
        case "update errors":
            return {
                input: state.input,
                errors: action.errors,
                lastChange: "error"
            };
    }
    throw "unhandled action";
}

function extractInput(children: string | undefined): string {
    return children !== undefined ? children : "";
}

const errorDelay = 500;

export const SentenceInput: React.VFC<SentenceInputProps> = ({ initialValue, onStateChange }) => {
    const [state, dispatch] = useReducer(
        reducer,
        {
            input: extractInput(initialValue),
            errors: []
        }
    );
    const editor = useMemo(() => withReact(createEditor()), []);
    const editorRef = useRef<HTMLDivElement>(null);
    const [selectedErr, setSelectedErr] = useState<string>();
    const currentInputRef = useRef<string>();

    function invokeOnStateChange(newState: SentenceInputState): void {
        if (onStateChange) {
            onStateChange(newState);
        }
    }

    function setCursor(errKey: string): void {
        if (editorRef.current === null) {
            return;
        }
        const index = state.errors.findIndex((err) => err.key === errKey);
        if (index !== -1) {
            const { anchor } = state.errors[index];
            Transforms.select(editor, anchor);
            setSelectedErr(errKey);
            editorRef.current.focus();
        }
    }

    const errListItems: ErrorListItem[] = state.errors.map(({ key, message, anchor }) => {
        const lineNum = anchor.path[0] + 1;
        const colNum = anchor.offset + 1;
        return {
            key,
            message: `[${lineNum}, ${colNum}]: ${message}`
        };
    });

    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "editorContainer")}>
                <ExtendedTextEditor
                    editor={editor}
                    editorRef={editorRef}
                    onErrorChange={(newErrors) => {
                        const input: string = currentInputRef.current !== undefined
                            ? currentInputRef.current
                            : state.input;
                        invokeOnStateChange({
                            value: input,
                            errorState: newErrors.length === 0 ? "none" : "errors"
                        });
                        dispatch({
                            type: "update errors",
                            errors: newErrors
                        });
                    }}
                    className={accessClassName(styles, "editor")}
                    onInputChange={(newInput) => {
                        invokeOnStateChange({
                            value: newInput,
                            errorState: "calculating"
                        });
                        currentInputRef.current = newInput;
                        dispatch({
                            type: "update input",
                            input: newInput
                        });
                    }}
                    errorChangeInvoke="always"
                    errorDelay={errorDelay}
                >
                    {state.input}
                </ExtendedTextEditor>
            </div>
            <div className={accessClassName(styles, "errorListContainer")}>
                <ExtendedErrorList
                    onItemSelect={setCursor}
                    selectedKey={selectedErr}
                    className={accessClassName(styles, "errorList")}
                >
                    {errListItems}
                </ExtendedErrorList>
            </div>
        </div>
    );
};

const ExtendedTextEditor = withClassNameProp(TextEditor);
const ExtendedErrorList = withClassNameProp(ErrorList);