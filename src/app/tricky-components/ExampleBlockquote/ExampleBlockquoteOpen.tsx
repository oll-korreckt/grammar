import { RenderFragment } from "@app/basic-components/HTMLObjectRender/elements";
import { accessClassName } from "@app/utils";
import { HTMLBlockquoteObject } from "@lib/utils";
import { ElementPage, ElementPageId } from "@utils/element";
import { Model } from "@utils/model";
import { SERVER } from "config";
import React from "react";
import { IconType } from "react-icons";
import { FaPlusCircle, FaRedo, FaTimes } from "react-icons/fa";
import { QueryFunctionContext, useQuery } from "react-query";
import { ExampleBlockquoteOpenSuccess } from "./ExampleBlockquoteOpenSuccess";
import styles from "./_styles.module.scss";

export interface ExampleBlockquoteOpenProps {
    children: HTMLBlockquoteObject;
    onExit?: () => void;
}

type ExampleBlockquoteKey = ["ExampleBlockquote", ElementPageId, string];

function getKey({ custom }: HTMLBlockquoteObject): ExampleBlockquoteKey {
    if (custom === undefined) {
        throw "BlockquoteObject is missing a 'custom' property value";
    }
    const idParts = custom.split(".");
    if (idParts.length !== 2) {
        throw `Invalid id: '${custom}'`;
    }
    const [pageValue, name] = idParts;
    if (!ElementPage.isPageType(pageValue)) {
        throw `Invalid ElementPageType: '${custom}'`;
    }
    const page = ElementPage.typeToId(pageValue);
    return ["ExampleBlockquote", page, name];
}

async function queryFn({ queryKey }: QueryFunctionContext<ExampleBlockquoteKey>): Promise<Model> {
    const [, page, name] = queryKey;
    const queryStr = `${SERVER}/api/model/${page}/${name}`;
    const response = await fetch(queryStr);
    if (!response.ok) {
        let errorMsg = "error occurred while loading data";
        try {
            errorMsg = await response.text();
        } catch {
        }
        throw errorMsg;
    }
    const output = await response.json();
    return output;
}

export const ExampleBlockquoteOpen: React.VFC<ExampleBlockquoteOpenProps> = ({ children, onExit }) => {
    const key = getKey(children);
    const query = useQuery(
        key,
        queryFn,
        {
            retry: false
        }
    );

    const invokeExit = () => onExit && onExit();

    switch (query.status) {
        case "loading":
            return (
                <blockquote className={accessClassName(styles, "exampleBlockquote", "exampleBlockquoteClosed")}>
                    <RenderFragment>
                        {children.content}
                    </RenderFragment>
                    <div className={accessClassName(styles, "buttonContainer")}>
                        <FaPlusCircle/>
                    </div>
                    <div className={accessClassName(styles, "loading")}/>
                </blockquote>
            );
        case "error":
            return (
                <blockquote>
                    <div className={accessClassName(styles, "errorMsg")}>
                        <p>Error loading model.</p>
                        <div>
                            <ErrorButton
                                icon={FaRedo}
                                onClick={() => query.refetch()}
                            >
                                Retry
                            </ErrorButton>
                            <ErrorButton
                                icon={FaTimes}
                                onClick={invokeExit}
                            >
                                Cancel
                            </ErrorButton>
                        </div>
                    </div>
                </blockquote>
            );
        case "success":
            return (
                <ExampleBlockquoteOpenSuccess onExit={invokeExit}>
                    {query.data}
                </ExampleBlockquoteOpenSuccess>
            );
        case "idle":
            throw `Invalid status: '${query.status}'`;
    }
};

interface ErrorButtonProps {
    icon: IconType;
    children: string;
    onClick?: () => void;
}

const ErrorButton: React.VFC<ErrorButtonProps> = ({ children, icon, onClick }) => {
    const Icon = icon;
    return (
        <div
            className={accessClassName(styles, "errorButton")}
            onClick={() => onClick && onClick()}
        >
            <Icon className={accessClassName(styles, "errorButtonIcon")}/>
            {children}
        </div>
    );
};