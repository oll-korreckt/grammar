import { MessageBoxButton } from "@app/basic-components/MessageBox";
import { MessageBoxModal, MessageBoxModalResponse } from "@app/basic-components/MessageBoxModal";
import { EditForm } from "@app/tricky-components/EditForm";
import { EditFormState } from "@app/tricky-components/EditForm/reducer";
import { useClientSide } from "@app/utils";
import { SimpleObject } from "@lib/utils";
import { NextPage, GetStaticProps } from "next";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryFunctionContext, useMutation, useQuery } from "react-query";

const AppPage: NextPage = () => {
    const client = useClientSide();
    return client
        ? <EditFormComponent/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    return { props: {} };
};

type QueryKey = ["EditFormComponent", "app"];

async function queryFn({ queryKey }: QueryFunctionContext<QueryKey>): Promise<EditFormState | undefined> {
    const [, key] = queryKey;
    const value = localStorage.getItem(key);
    if (value === null) {
        return undefined;
    }
    const output = JSON.parse(value);
    return output;
}

interface MutationInput {
    key: string;
    state: EditFormState;
}

async function mutateFn({ key, state }: MutationInput): Promise<void> {
    const saveState: EditFormState = SimpleObject.clean(state);
    const saveStr = JSON.stringify(saveState);
    localStorage.setItem(key, saveStr);
}

function useLocalStorage(): "loading" | [EditFormState | undefined, (state: EditFormState) => void] {
    const queryKey: QueryKey = ["EditFormComponent", "app"];
    const query = useQuery(
        queryKey,
        queryFn
    );
    const mut = useMutation(
        mutateFn
    );

    if (query.status === "loading") {
        return "loading";
    } else if (query.status === "success") {
        const [, key] = queryKey;
        return [query.data, (state) => mut.mutate({ key, state })];
    }
    throw `Unhandled query status '${query.status}'`;
}

const EditFormComponent: React.VFC = () => {
    const storage = useLocalStorage();

    if (storage === "loading") {
        return <></>;
    }

    const [state, update] = storage;

    return (
        <ErrorBoundary
            FallbackComponent={FallbackComponent}
        >
            <EditForm
                initialState={state}
                saveState={update}
            />
        </ErrorBoundary>
    );
};

const FallbackComponent: React.VFC = () => {
    function onResponse(response: MessageBoxModalResponse): void {
        if (response.type === "button" && response.text === "Reset") {
            const key: QueryKey[1] = "app";
            localStorage.removeItem(key);
            location.reload();
        }
    }

    const buttons: MessageBoxButton[] = [{
        text: "Reset",
        alignment: "right"
    }];

    return (
        <MessageBoxModal
            buttons={buttons}
            onResponse={onResponse}
        >
            An error has occurred. Your state must be reset in order to fix it.
        </MessageBoxModal>
    );
};

export default AppPage;