import { HTMLBlockquoteObject } from "@lib/utils";
import { ElementPage, ElementPageType } from "@utils/element";
import { ElementModelAddress } from "@utils/model";
import { SERVER } from "config";
import React, { useEffect, useReducer } from "react";
import { useQuery } from "react-query";
import { ExampleBlockquoteClosed } from "./ExampleBlockquoteClosed";
import { ExampleBlockquoteOpen } from "./ExampleBlockquoteOpen";

export interface ExampleBlockquoteProps {
    children: HTMLBlockquoteObject;
}

async function queryFn(): Promise<Set<string>> {
    if (process.env.NODE_ENV !== "development") {
        return new Set();
    }
    const response = await fetch(`${SERVER}/api/model`);
    if (!response.ok) {
        let errMsg = "error during query for all models";
        try {
            errMsg = await response.text();
        } catch {
        }
        throw errMsg;
    }
    const output: ElementModelAddress[] = await response.json();
    return new Set(output.map((address) => ElementModelAddress.toString(address)));
}

type State = {
    type: "closed" | "open";
} | {
    type: "error";
    msg?: string;
}

type Action = State;

function reducer(state: State, action: Action): State {
    return action;
}

export const ExampleBlockquote: React.VFC<ExampleBlockquoteProps> = ({ children }) => {
    const query = useQuery<Set<string>, string>(
        ["ExampleBlockquote"],
        queryFn,
        { onError: (msg) => dispatch({ type: "error", msg }) }
    );
    const [state, dispatch] = useReducer(reducer, { type: "closed" });

    useEffect(() => {
        if (children.custom === undefined) {
            dispatch({
                type: "error",
                msg: "No custom property given"
            });
            return;
        }
        if (process.env.NODE_ENV === "development"
            && query.status === "success") {
            const [pageType, name] = children.custom.split(".");
            const value = ElementModelAddress.toString({
                page: ElementPage.typeToId(pageType as ElementPageType),
                name: name
            });
            if (!query.data.has(value)) {
                dispatch({
                    type: "error",
                    msg: `No model exists for '${children.custom}'`
                });
            }
        }
    }, [query.status, query.data, children.custom]);

    switch (state.type) {
        case "closed":
            return (
                <ExampleBlockquoteClosed onOpen={() => dispatch({ type: "open" })}>
                    {children}
                </ExampleBlockquoteClosed>
            );
        case "open":
            return (
                <ExampleBlockquoteOpen onExit={() => dispatch({ type: "closed" })}>
                    {children}
                </ExampleBlockquoteOpen>
            );
        case "error":
            const errMsg = state.msg === undefined
                ? "An error occurred"
                : state.msg;
            return (
                <blockquote>
                    {errMsg}
                </blockquote>
            );
    }
};