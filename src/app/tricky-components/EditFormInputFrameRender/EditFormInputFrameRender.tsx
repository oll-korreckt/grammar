import { accessClassName } from "@app/utils";
import { scan, ScannerError } from "@domain/language/scanner";
import React from "react";
import { ErrorList, ErrorListItem } from "../ErrorList";
import InputFormStyles from "../InputForm/_styles.module.scss";
import TextEditorStyles from "../TextEditor/_styles.module.scss";
import styles from "./_styles.module.scss";

export interface EditFormInputFrameRenderProps {
    inputText?: string;
    showErrors?: boolean;
}

function getErrors(inputText: string, showErrors: boolean | undefined): ScannerError[] {
    if (showErrors !== true) {
        return [];
    }
    const scanResult = scan(inputText);
    if (scanResult.type === "tokens") {
        return [];
    }
    return scanResult.data;
}

export const EditFormInputFrameRender: React.FC<EditFormInputFrameRenderProps> = ({ inputText, showErrors }) => {
    const defInputText = inputText !== undefined ? inputText : "";
    const errors = getErrors(defInputText, showErrors);
    const errorListItems: ErrorListItem[] = errors.map((err, index) => {
        return {
            key: `${index}`,
            message: `[1, ${err.start}]: ${err.message}`
        };
    });

    return (
        <div className={accessClassName(InputFormStyles, "inputForm")}>
            <TextEditorRender errors={errors}>
                {defInputText}
            </TextEditorRender>
            <ErrorList>
                {errorListItems}
            </ErrorList>
        </div>
    );
};

interface TextEditorRenderProps {
    children: string;
    errors: ScannerError[];
}

interface Token {
    type: "text" | "error";
    content: string;
}

function getTokens(text: string, errors: ScannerError[]): Token[] {
    if (errors.length === 0) {
        return [{ type: "text", content: text }];
    }
    const output: Token[] = [];
    let position = 0;
    for (let index = 0; index < errors.length; index++) {
        const { start, end }: ScannerError = errors[index];
        if (position !== start) {
            output.push({
                type: "text",
                content: text.substring(position, start)
            });
        }
        output.push({
            type: "error",
            content: text.substring(start, end)
        });
        position = end;
    }
    if (position !== text.length) {
        output.push({ type: "text", content: text.substring(position) });
    }
    return output;
}

const TextEditorRender: React.VFC<TextEditorRenderProps> = ({ children, errors }) => {
    const editorStyles = `${accessClassName(InputFormStyles, "extendedTextEditor")} ${accessClassName(TextEditorStyles, "editor")}`;
    const tokens = getTokens(children, errors);
    console.log(tokens);
    return (
        <div className={editorStyles}>
            {tokens.map(({ type, content }, index) => {
                const className = type === "error" ? ["error"] : [];
                const key = `${index} ${content.length}`;
                return (
                    <span
                        key={key}
                        className={accessClassName(styles, ...className)}
                    >
                        {content}
                    </span>
                );
            })}
        </div>
    );
};