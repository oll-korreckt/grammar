import { EditForm } from "@app/tricky-components/EditForm";
import { EditFormState } from "@app/tricky-components/EditForm/reducer";
import { accessClassName, DiagramState } from "@app/utils";
import { ElementPageId } from "@utils/element";
import { ElementModelAddress, Model } from "@utils/model/types";
import { SERVER } from "config";
import React, { useRef } from "react";
import { QueryFunctionContext, useMutation, useQuery } from "react-query";
import styles from "./_styles.module.scss";

export interface EditModelPageProps {
    children: ElementModelAddress;
    exitEdit?: () => void;
}

type QueryKey = ["EditModelPage", ElementPageId, string];

async function queryFn({ queryKey }: QueryFunctionContext<QueryKey>): Promise<Model> {
    const [, page, name] = queryKey;
    const queryStr = `${SERVER}/api/model/${page}/${name}`;
    const response = await fetch(queryStr);
    if (!response.ok) {
        throw `error while fetching data for '${page}.${name}'`;
    }
    const output = await response.json();
    return output;
}

interface UpdateArg {
    address: ElementModelAddress;
    model: Model;
}

async function updateFn({ address, model }: UpdateArg): Promise<void> {
    const { page, name } = address;
    const queryStr = `${SERVER}/api/model/${page}/${name}`;
    const response = await fetch(
        queryStr,
        {
            method: "PUT",
            body: JSON.stringify(model)
        }
    );
    if (!response.ok) {
        throw `error while updating data for '${page}.${name}'`;
    }
}

export const EditModelPage: React.VFC<EditModelPageProps> = ({ children, exitEdit }) => {
    const { page, name } = children;
    const key: QueryKey = ["EditModelPage", page, name];
    const query = useQuery(key, queryFn, { retry: false });
    const saveModel = useMutation(updateFn);

    switch (query.status) {
        case "idle":
            throw "unexpected state";
        case "error":
            throw `error loading data for '${page}.${name}'`;
        case "loading":
            return <>Loading</>;
        case "success":
            return (
                <EditModelPageView
                    initialModel={query.data}
                    saveModel={(model) => saveModel.mutate({ address: children, model })}
                    exitEdit={exitEdit}
                />
            );
    }
};

interface EditModelPageViewProps {
    initialModel?: Model;
    saveModel?: (model: Model) => void;
    exitEdit?: () => void;
}

function getEditFormState(model: Model | undefined): EditFormState | undefined {
    if (model === undefined) {
        return undefined;
    }
    const { diagram, defaultCategory, defaultElement } = model;
    const output: EditFormState = {
        stage: "input",
        diagram: diagram,
        inputText: DiagramState.getText(diagram)
    };
    if (defaultCategory) {
        output.category = defaultCategory;
    }
    if (defaultElement) {
        output.selected = defaultElement;
    }
    return output;
}

function getModel(state: EditFormState | undefined): Model {
    if (state === undefined) {
        throw "cannot save undefined model";
    }
    const { diagram, category, selected } = state;
    if (diagram === undefined) {
        throw "cannot save with undefined diagram";
    }
    const output: Model = { diagram };
    if (category) {
        output.defaultCategory = category;
    }
    if (selected) {
        output.defaultElement = selected;
    }
    return output;
}

const EditModelPageView: React.VFC<EditModelPageViewProps> = ({ initialModel, saveModel, exitEdit }) => {
    const stateRef = useRef(getEditFormState(initialModel));

    function saveState(state: EditFormState): void {
        stateRef.current = state;
    }

    return (
        <div
            className={accessClassName(styles, "editModelPage")}
        >
            <EditForm
                initialState={stateRef.current}
                saveState={saveState}
            />
            <div>
                <button
                    onClick={() => {
                        if (saveModel === undefined) {
                            return;
                        }
                        const currentModel = getModel(stateRef.current);
                        saveModel(currentModel);
                    }}
                >
                    Save
                </button>
                <button onClick={() => exitEdit && exitEdit()}>
                    Exit
                </button>
            </div>
        </div>
    );
};