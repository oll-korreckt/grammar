import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";

export interface MessageBoxProps {
    type: MessageBoxType;
    children: string;
    onResponse?: (response: MessageBoxResponse) => void;
}

export type MessageBoxType = "yes no";
export type MessageBoxResponse =
    | "yes"
    | "no";

export const MessageBox = makeRefComponent<HTMLDivElement, MessageBoxProps>("MessageBox", ({ type, children, onResponse }, ref) => {
    function invokeResponse(response: MessageBoxResponse): void {
        if (onResponse) {
            onResponse(response);
        }
    }

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "messageBox")}
        >
            <div className={accessClassName(styles, "messageSection")}>
                {children}
            </div>
            <div className={accessClassName(styles, "buttonSection")}>
                {type === "yes no" &&
                    <button
                        className={accessClassName(styles, "button")}
                        onClick={() => invokeResponse("yes")}
                    >
                        Yes
                    </button>
                }
                {type === "yes no" &&
                    <button
                        className={accessClassName(styles, "button")}
                        onClick={() => invokeResponse("no")}
                    >
                        No
                    </button>
                }
            </div>
        </div>
    );
});