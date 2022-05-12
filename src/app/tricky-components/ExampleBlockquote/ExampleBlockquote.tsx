import { HTMLBlockquoteObject } from "@lib/utils";
import React, { useState } from "react";
import { ExampleBlockquoteClosed } from "./ExampleBlockquoteClosed";
import { ExampleBlockquoteOpen } from "./ExampleBlockquoteOpen";

export interface ExampleBlockquoteProps {
    children: HTMLBlockquoteObject;
}

export const ExampleBlockquote: React.VFC<ExampleBlockquoteProps> = ({ children }) => {
    const [state, setState] = useState<"closed" | "open">("closed");
    return state === "closed"
        ?
        (
            <ExampleBlockquoteClosed onOpen={() => setState("open")}>
                {children}
            </ExampleBlockquoteClosed>
        )
        :
        (
            <ExampleBlockquoteOpen onExit={() => setState("closed")}>
                {children}
            </ExampleBlockquoteOpen>
        );
};