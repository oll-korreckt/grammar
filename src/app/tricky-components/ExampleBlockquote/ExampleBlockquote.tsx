import { HTMLBlockquoteObject } from "@lib/utils";
import React, { useState } from "react";
import { ExampleBlockquoteClosed } from "./ExampleBlockquoteClosed";
import { ExampleBlockquoteOpen } from "./ExampleBlockquoteOpen";
import { createCheckHook } from "./utils";

export interface ExampleBlockquoteProps {
    children: HTMLBlockquoteObject;
}

const useCheckHook = createCheckHook();

export const ExampleBlockquote: React.VFC<ExampleBlockquoteProps> = ({ children }) => {
    const [state, setState] = useState<"open" | "closed">("closed");
    const check = useCheckHook(children);

    if (check.type !== "ok") {
        const content = check.type === "error"
            ? check.msg
            : "Running check";
        return (
            <blockquote>
                {content}
            </blockquote>
        );
    } else if (state === "closed") {
        return (
            <ExampleBlockquoteClosed onOpen={() => setState("open")}>
                {children}
            </ExampleBlockquoteClosed>
        );
    } else {
        return (
            <ExampleBlockquoteOpen onExit={() => setState("closed")}>
                {children}
            </ExampleBlockquoteOpen>
        );
    }
};