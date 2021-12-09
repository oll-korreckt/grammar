import { accessClassName, DecoratorRange } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import React, { useMemo, useRef, useState } from "react";
import { createEditor, Transforms } from "slate";
import { withReact } from "slate-react";
import { ErrorList, ErrorListItem } from "../ErrorList";
import { TextEditor } from "../TextEditor";
import styles from "./_styles.scss";

export interface SentenceInputProps {
    children: string;
}

export const SentenceInput: React.FC<SentenceInputProps> = ({ children }) => {
    const editor = useMemo(() => withReact(createEditor()), []);
    const editorRef = useRef<HTMLDivElement>(null);
    const [errors, setErrors] = useState<DecoratorRange[]>([]);
    const [selectedErr, setSelectedErr] = useState<string>();

    function setCursor(errKey: string): void {
        if (editorRef.current === null) {
            return;
        }
        const index = errors.findIndex((err) => err.key === errKey);
        if (index !== -1) {
            const { anchor } = errors[index];
            Transforms.select(editor, anchor);
            setSelectedErr(errKey);
            editorRef.current.focus();
        }
    }

    const errListItems: ErrorListItem[] = errors.map(({ key, message, anchor }) => {
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
                    onErrorStateChange={setErrors}
                    className={accessClassName(styles, "editor")}
                >
                    {children}
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