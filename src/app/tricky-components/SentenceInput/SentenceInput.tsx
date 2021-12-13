import { accessClassName, DecoratorRange } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import React, { useMemo, useReducer, useRef, useState } from "react";
import { createEditor, Transforms } from "slate";
import { withReact } from "slate-react";
import { ErrorList, ErrorListItem } from "../ErrorList";
import { TextEditor } from "../TextEditor";
import styles from "./_styles.scss";

export interface SentenceInputProps {
    children?: string | undefined;
    onSubmit?: (value: string) => void;
}

interface State {
    input: string;
    errors: DecoratorRange[];
    lastChange?: "input" | "error";
    deferredSubmit?: boolean;
}

type Action = {
    type: "update input";
    input: string;
} | {
    type: "update errors";
    errors: DecoratorRange[];
} | {
    type: "activate deferral";
} | {
    type: "remove deferral";
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "update input":
            return {
                ...state,
                input: action.input,
                errors: state.errors,
                lastChange: "input"
            };
        case "update errors":
            return {
                ...state,
                input: state.input,
                errors: action.errors,
                lastChange: "error"
            };
        case "activate deferral":
            return {
                ...state,
                deferredSubmit: true
            };
        case "remove deferral":
            const output = { ...state };
            delete output.deferredSubmit;
            return output;
    }
    throw "unhandled action";
}

function extractInput(children: string | undefined): string {
    return children !== undefined ? children : "";
}

const errorDelay = 500;

export const SentenceInput: React.VFC<SentenceInputProps> = ({ children, onSubmit }) => {
    const [state, dispatch] = useReducer(
        reducer,
        {
            input: extractInput(children),
            errors: []
        }
    );
    const editor = useMemo(() => withReact(createEditor()), []);
    const editorRef = useRef<HTMLDivElement>(null);
    const [selectedErr, setSelectedErr] = useState<string>();

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

    function invokeSubmit(): void {
        if (onSubmit) {
            onSubmit(state.input);
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

    if (state.deferredSubmit && state.lastChange === "error") {
        if (state.errors.length === 0) {
            invokeSubmit();
        } else {
            // errors are present so do nothing
            dispatch({ type: "remove deferral" });
        }
    }

    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "editorContainer")}>
                <ExtendedTextEditor
                    editor={editor}
                    editorRef={editorRef}
                    onErrorChange={(newErrors) => {
                        dispatch({
                            type: "update errors",
                            errors: newErrors
                        });
                    }}
                    className={accessClassName(styles, "editor")}
                    onInputChange={(newInput) => {
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
            <button
                disabled={state.errors.length > 0}
                style={{ padding: "15px", width: "100px" }}
                onClick={() => {
                    if (state.lastChange === "input") {
                        dispatch({ type: "activate deferral" });
                    } else {
                        invokeSubmit();
                    }
                }}
            >
                Submit
            </button>
        </div>
    );
};

const ExtendedTextEditor = withClassNameProp(TextEditor);
const ExtendedErrorList = withClassNameProp(ErrorList);