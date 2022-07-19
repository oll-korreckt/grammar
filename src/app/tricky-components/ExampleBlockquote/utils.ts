import { DiagramState } from "@app/utils";
import { HTMLBlockquoteObject, HTMLContent, HTMLObject } from "@lib/utils";
import { ElementPageId } from "@utils/element";
import { ElementModelAddress, Model } from "@utils/model";
import { useEffect, useState } from "react";
import { QueryFunctionContext, useQuery } from "react-query";

export type CheckHookState = {
    type: "ok";
} | {
    type: "checking";
} | {
    type: "error";
    msg: string;
}

type CheckModelKeyBase = ["ExampleBlockquote", "Check"];
type CheckModelKey =
    | [...CheckModelKeyBase, "Invalid"]
    | [...CheckModelKeyBase, ElementPageId, string];

type InternalState = {
    type: "check address";
} | {
    type: "check model";
} | {
    type: "done";
} | {
    type: "error";
    msg: string;
}

async function availableQueryFn(): Promise<Set<string>> {
    const response = await fetch("/api/model");
    if (!response.ok) {
        let errMsg = "Unable to fetch addresses";
        try {
            errMsg = await response.text();
        } catch {
        }
        throw errMsg;
    }
    const addresses: ElementModelAddress[] = await response.json();
    return new Set(addresses.map((address) => ElementModelAddress.toString(address)));
}

async function textQueryFn({ queryKey }: QueryFunctionContext<CheckModelKey>): Promise<string> {
    if (queryKey.length === 3) {
        throw "No valid address provided";
    }
    const [,, page, name] = queryKey;
    const response = await fetch(`/api/model/${page}/${name}`);
    if (!response.ok) {
        let errMsg = `error during query for '${page}.${name}'`;
        try {
            errMsg = await response.text();
        } catch {
        }
        throw errMsg;
    }
    const { diagram }: Model = await response.json();
    const text = DiagramState.getText(diagram);
    return text;
}

function getModelKey(custom: string | undefined): CheckModelKey {
    if (custom === undefined) {
        return ["ExampleBlockquote", "Check", "Invalid"];
    }
    try {
        const { page, name } = ElementModelAddress.fromString(custom);
        return ["ExampleBlockquote", "Check", page, name];
    } catch {
        return ["ExampleBlockquote", "Check", "Invalid"];
    }
}

function _getHTMLObjectText(object: HTMLObject): string {
    if (typeof object === "string") {
        return object;
    }

    switch (object.type) {
        case "b":
        case "i":
        case "p":
        case "code":
            return _getHTMLContentText(object.content);
    }
    throw `received unhandled html object type: '${object.type}'`;
}

function _getHTMLContentText(content: HTMLContent): string {
    if (content === undefined) {
        throw "Cannot get text from undefined";
    }
    if (Array.isArray(content)) {
        let output = "";
        content.forEach((obj) => output += _getHTMLObjectText(obj));
        return output;
    }
    return _getHTMLObjectText(content);
}

export function createCheckHook(): (blockquote: HTMLBlockquoteObject) => CheckHookState {
    if (process.env.NODE_ENV !== "development") {
        return () => { return { type: "ok" }; };
    }
    return ({ custom, content }) => {
        const modelKey = getModelKey(custom);
        const initialState: InternalState = modelKey.length === 3
            ? { type: "error", msg: "Invalid custom property received" }
            : { type: "check address" };
        const [state, setState] = useState<InternalState>(initialState);
        const addressQuery = useQuery<Set<string>, string>(
            ["ExampleBlockquote"],
            availableQueryFn,
            {
                enabled: false,
                onError: (msg) => setState({ type: "error", msg })
            }
        );
        const textQuery = useQuery<string, string, string, CheckModelKey>(
            modelKey,
            textQueryFn,
            {
                enabled: false,
                onError: (msg) => setState({ type: "error", msg })
            }
        );

        // run address query
        useEffect(() => {
            if (state.type === "check address" && addressQuery.status === "idle") {
                addressQuery.refetch();
            }
        }, [state.type, addressQuery]);

        // run address check
        useEffect(() => {
            if (state.type === "check address" && addressQuery.status === "success") {
                if (modelKey.length === 3) {
                    throw "error";
                }
                const [,, page, name] = modelKey;
                const addressStr = `${page}.${name}`;
                const data = addressQuery.data;
                if (data.has(addressStr)) {
                    setState({ type: "check model" });
                } else {
                    setState({
                        type: "error",
                        msg: `No model for '${addressStr}'`
                    });
                }
            }
        }, [state.type, modelKey, addressQuery.status, addressQuery.data]);

        // run model query
        useEffect(() => {
            if (state.type === "check model" && textQuery.status === "idle") {
                textQuery.refetch();
            }
        }, [state.type, textQuery]);

        // run model check
        useEffect(() => {
            if (state.type === "check model" && textQuery.status === "success") {
                const modelText = textQuery.data;
                try {
                    const contentText = _getHTMLContentText(content);
                    if (modelText === contentText) {
                        setState({ type: "done" });
                    } else {
                        setState({
                            type: "error",
                            msg: "Discrepancy between model and provided content"
                        });
                    }
                } catch (error) {
                    const errMsg = typeof error === "string"
                        ? error
                        : "Unexpected error occurred";
                    setState({
                        type: "error",
                        msg: errMsg
                    });
                }
            }
        }, [state.type, textQuery.status, textQuery.data, content]);

        switch (state.type) {
            case "done":
                return { type: "ok" };
            case "check address":
            case "check model":
                return { type: "checking" };
            case "error":
                return state;
        }
    };
}