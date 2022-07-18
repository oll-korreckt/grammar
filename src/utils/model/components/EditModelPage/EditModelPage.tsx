import { EditForm } from "@app/tricky-components/EditForm";
import { EditFormState } from "@app/tricky-components/EditForm/reducer";
import { accessClassName, DiagramState } from "@app/utils";
import { ElementModelAddress, Model } from "@utils/model/types";
import React, { useRef } from "react";
import { useMutation } from "react-query";
import Link from "next/link";
import styles from "./_styles.module.scss";

export interface EditModelPageProps {
    address: ElementModelAddress;
    children: Model;
}

interface UpdateArg {
    address: ElementModelAddress;
    model: Model;
}

async function updateFn({ address, model }: UpdateArg): Promise<void> {
    const { page, name } = address;
    const queryStr = `${process.env.NEXT_PUBLIC_URL}/api/model/${page}/${name}`;
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

export const EditModelPage: React.VFC<EditModelPageProps> = ({ children, address }) => {
    const saveModel = useMutation(updateFn);

    return (
        <EditModelPageView
            initialModel={children}
            saveModel={(model) => saveModel.mutate({ address, model })}
        />
    );
};

interface EditModelPageViewProps {
    initialModel?: Model;
    saveModel?: (model: Model) => void;
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

const EditModelPageView: React.VFC<EditModelPageViewProps> = ({ initialModel, saveModel }) => {
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
                <Link href={`${process.env.NEXT_PUBLIC_URL}/model`}>
                    <button>
                        Exit
                    </button>
                </Link>
            </div>
        </div>
    );
};