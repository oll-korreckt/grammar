import { accessClassName } from "@app/utils";
import { ElementPage } from "@utils/element";
import { Model, ElementModelAddress } from "@utils/model";
import React from "react";
import { useQuery, useMutation } from "react-query";
import { AddressCluster } from "../AddressCluster";
import { ModelPageContext } from "../types";
import styles from "./_styles.module.scss";

async function addressQueryFn(): Promise<ElementModelAddress[]> {
    const queryStr = `${process.env.NEXT_PUBLIC_URL}/api/model`;
    const response = await fetch(queryStr);
    if (!response.ok) {
        throw "error occurred while loading data";
    }
    const output = await response.json();
    return output;
}

async function deleteFn(address: ElementModelAddress): Promise<void> {
    const queryStr = `${process.env.NEXT_PUBLIC_URL}/api/model/${address.page}/${address.name}`;
    const response = await fetch(queryStr, { method: "DELETE" });
    if (!response.ok) {
        throw "error occurred while deleting data";
    }
}

interface RenameArg {
    address: ElementModelAddress;
    newAddress: ElementModelAddress;
}

async function renameFn({ address, newAddress }: RenameArg): Promise<void> {
    const queryStr = `${process.env.NEXT_PUBLIC_URL}/api/model/${address.page}/${address.name}`;
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
    const queryStr = `${process.env.NEXT_PUBLIC_URL}/api/model/${address.page}/${address.name}`;
    const options: RequestInit = { method: "POST" };
    if (model) {
        options.body = JSON.stringify(model);
    }
    const response = await fetch(queryStr, options);
    if (!response.ok) {
        throw response.statusText;
    }
}

export const DisplayModelPage: React.VFC = () => {
    const addressQuery = useQuery(
        "ModelPage: AddressQuery",
        addressQueryFn,
        { retry: false }
    );
    const deleteMut = useMutation(
        deleteFn,
        {
            onSuccess: () => addressQuery.refetch()
        }
    );
    const addMut = useMutation(
        addFn,
        {
            onSuccess: () => addressQuery.refetch()
        }
    );
    const renameMut = useMutation(
        renameFn,
        {
            onSuccess: () => addressQuery.refetch()
        }
    );

    if (addressQuery.status === "loading") {
        return <>Loading</>;
    }

    if (addressQuery.status !== "success") {
        throw `Unhandled query state '${addressQuery.status}'`;
    }

    const ctxVal: ModelPageContext = {
        sendAdd: (address, onSuccess) => addMut.mutate({ address }, { onSuccess }),
        sendDelete: (address, onSuccess) => deleteMut.mutate(address, { onSuccess }),
        sendRename: (address, newAddress, onSuccess) => renameMut.mutate({ address, newAddress }, { onSuccess })
    };

    const addressClusters = getClusters(addressQuery.data);

    return (
        <ModelPageContext.Provider value={ctxVal}>
            <div className={accessClassName(styles, "displayModelPage")}>
                {addressClusters.map((cluster) => {
                    return (
                        <AddressCluster
                            key={cluster.page}
                        >
                            {cluster}
                        </AddressCluster>
                    );
                })}
            </div>
        </ModelPageContext.Provider>
    );
};

function getClusters(addresses: ElementModelAddress[]): AddressCluster[] {
    const holder: Record<string, string[]> = {};
    addresses.forEach(({ page, name }) => {
        let names: string[];
        if (page in holder) {
            names = holder[page];
        } else {
            names = [];
            holder[page] = names;
        }
        names.push(name);
    });
    const pages = ElementPage.getAllPageIds();
    return pages.map((page) => {
        return page in holder
            ? { page, names: holder[page] }
            : { page, names: [] };
    });
}