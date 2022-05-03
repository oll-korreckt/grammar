import { HTMLBlockquoteObject } from "@lib/utils";
import { ElementPage } from "@utils/element";
import { Model } from "@utils/model";
import { SERVER } from "config";
import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { ExampleBlockquoteView } from "./ExampleBlockquoteView";
import { useExampleBlockquote } from "./reducer";
import { ClosedState, ErrorState, ExampleBlockquoteProps, LoadingState, MasterState, OpenState, ViewState } from "./types";

async function queryFn({ custom }: HTMLBlockquoteObject): Promise<Model> {
    if (custom === undefined) {
        throw "BlockquoteObject is missing a 'custom' property value";
    }
    const idParts = custom.split(".");
    if (idParts.length !== 2) {
        throw `Invalid id: '${custom}'`;
    }
    const [pageType, model] = idParts;
    if (!ElementPage.isPageType(pageType)) {
        throw `Invalid ElementPageType: '${custom}'`;
    }
    const elementPageId = ElementPage.typeToId(pageType);
    const queryStr = `${SERVER}/api/model/${elementPageId}/${model}`;
    const response = await fetch(queryStr);
    if (!response.ok) {
        throw "error occurred while loading data";
    }
    const output = await response.json();
    return output;
}

function transferValues<T extends ViewState>(source: MasterState, ...keys: [keyof T, keyof MasterState][]): T {
    const output: Record<string, any> = {};
    keys.forEach(([targetKey, sourceKey]) => {
        const value = source[sourceKey];
        if (value !== undefined) {
            output[targetKey as string] = value;
        }
    });
    return output as T;
}

function convertState(state: MasterState): ViewState {
    switch (state.type) {
        case "open": {
            const output = transferValues<OpenState>(
                state,
                ["type", "type"],
                ["children", "lexemes"],
                ["settings", "labelSettings"],
                ["showReset", "showReset"],
                ["category", "category"],
                ["selectedElement", "selectedElement"]
            );
            const { selectedElement } = output;
            if (selectedElement) {
                output.showUpLevel = true;
            }
            return output;
        }
        case "closed":
            return transferValues<ClosedState>(
                state,
                ["type", "type"],
                ["children", "bqObj"]
            );
        case "loading":
            return transferValues<LoadingState>(
                state,
                ["type", "type"],
                ["children", "bqObj"]
            );
        case "error":
            return transferValues<ErrorState>(
                state,
                ["type", "type"]
            );
    }
}

export const ExampleBlockquote: React.VFC<ExampleBlockquoteProps> = ({ blockquote }) => {
    const [state, dispatch] = useExampleBlockquote(blockquote);
    const { refetch } = useQuery(
        "ExampleBlockquote",
        async () => await queryFn(blockquote),
        {
            retry: false,
            enabled: false,
            onError: () => dispatch({ type: "loading: fetch error" }),
            onSuccess: (data) => dispatch({ type: "loading: data fetched", data })
        }
    );

    useEffect(() => {
        if (state.type === "loading") {
            refetch();
        }
    }, [state.type, refetch]);

    const viewState = convertState(state);

    return (
        <ExampleBlockquoteView
            dispatch={dispatch}
            {...viewState}
        />
    );
};