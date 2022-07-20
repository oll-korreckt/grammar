import { accessClassName } from "@app/utils";
import { makeRefComponent, mergeRefs } from "@app/utils/hoc";
import React, { useEffect, useRef } from "react";
import styles from "./_styles.module.scss";
import hash from "object-hash";

export interface NewTextEditorProps {
    children?: string;
    onInputChange?: (input: string) => void;
    errors?: boolean;
    cursorPosition?: [line: number, column: number];
}

function getPosition(text: string, [line, column]: [number, number]): number {
    const textLines = text.split("\n");
    let output = 0;
    for (let index = 0; index < line; index++) {
        const textLine = textLines[index];
        output += textLine.length;
    }
    output += column;
    return output;
}

export const NewTextEditor = makeRefComponent<HTMLTextAreaElement, NewTextEditorProps>("NewTextEditor", ({ onInputChange, errors, cursorPosition, children }, passRef) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const classes = ["textEditor"];
    if (errors) {
        classes.push("textEditorError");
    }

    const cursorPositionHash = hash(cursorPosition ? cursorPosition : null);

    useEffect(() => {
        if (ref.current === null
            || ref.current.textContent === null
            || cursorPosition === undefined) {
            return;
        }
        const pos = getPosition(ref.current.textContent, cursorPosition);
        ref.current.focus();
        ref.current.selectionStart = pos;
        ref.current.selectionEnd = pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursorPositionHash]);

    return (
        <textarea
            ref={mergeRefs(passRef, ref)}
            className={accessClassName(styles, ...classes)}
            onChange={(e) => onInputChange && onInputChange(e.target.value)}
            value={children}
        />
    );
});