import { Model, ElementModelAddress } from "@utils/model";
import { SERVER } from "config";
import React, { useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import { ModelPageView } from "../ModelPageView";
import { ModelPageContext } from "../types";
import { useModelPage } from "./reducer";

async function queryFn(): Promise<ElementModelAddress[]> {
    const queryStr = `${SERVER}/api/model`;
    const response = await fetch(queryStr);
    if (!response.ok) {
        throw "error occurred while loading data";
    }
    const output = await response.json();
    return output;
}

async function deleteFn(address: ElementModelAddress): Promise<void> {
    const queryStr = `${SERVER}/api/model/${address.page}/${address.name}`;
    const response = await fetch(queryStr, { method: "DELETE" });
    if (!response.ok) {
        throw "error occurred while deleting data";
    }
}

interface UpdateArg {
    address: ElementModelAddress;
    model: Model;
}

async function updateFn({ address, model }: UpdateArg): Promise<void> {
    const queryStr = `${SERVER}/api/model/${address.page}/${address.name}`;
    console.log({ address, model });
    const response = await fetch(
        queryStr,
        {
            method: "PUT",
            body: JSON.stringify(model)
        }
    );
    if (!response.ok) {
        throw "error occurred during put request";
    }
}

interface RenameArg {
    address: ElementModelAddress;
    newAddress: ElementModelAddress;
}

async function renameFn({ address, newAddress }: RenameArg): Promise<void> {
    const queryStr = `${SERVER}/api/model/${address.page}/${address.name}`;
    const response = await fetch(
        queryStr,
        {
            method: "PATCH",
            body: JSON.stringify(newAddress)
        }
    );
    if (!response.ok) {
        throw "error occurred during patch request";
    }
}

interface AddArg {
    address: ElementModelAddress;
    model?: Model;
}

async function addFn({ address, model }: AddArg): Promise<void> {
    const queryStr = `${SERVER}/api/model/${address.page}/${address.name}`;
    const options: RequestInit = { method: "POST" };
    if (model) {
        options.body = JSON.stringify(model);
    }
    const response = await fetch(queryStr, options);
    if (!response.ok) {
        throw response.statusText;
    }
}

export const ModelPage: React.VFC = () => {
    const [state, dispatch] = useModelPage();
    const { refetch } = useQuery(
        "ModelPage",
        queryFn,
        {
            retry: false,
            enabled: false,
            onSuccess: (data) => dispatch({ type: "loading: data fetched", data })
        }
    );
    const deleteMut = useMutation(
        deleteFn,
        {
            onSuccess: () => refetch()
        }
    );
    const updateMut = useMutation(
        updateFn,
        {
            onSuccess: () => refetch()
        }
    );
    const addMut = useMutation(
        addFn,
        {
            onSuccess: () => refetch()
        }
    );
    const renameMut = useMutation(
        renameFn,
        {
            onSuccess: () => refetch()
        }
    );

    useEffect(() => {
        if (state.type === "initial") {
            refetch();
        }
    }, [state.type, refetch]);

    const ctxVal: ModelPageContext = {
        sendAdd: (address, onSuccess) => addMut.mutate({ address }, { onSuccess }),
        sendDelete: (address, onSuccess) => deleteMut.mutate(address, { onSuccess }),
        sendEdit: (address, model, onSuccess) => updateMut.mutate({ address, model }, { onSuccess }),
        sendRename: (address, newAddress, onSuccess) => renameMut.mutate({ address, newAddress }, { onSuccess })
    };

    return (
        <ModelPageContext.Provider value={ctxVal}>
            <ModelPageView
                state={state}
                dispatch={dispatch}
            />
        </ModelPageContext.Provider>
    );
};