import { ElementPageId } from "@utils/element";
import { ElementModelAddress } from "@utils/model";
import React from "react";
import { Model } from "../types";

export type PageStateType =
    | "initial"
    | "loading"
    | "error"
    | "data";

export interface ModelPageState {
    type: PageStateType;
    data: AddressCluster[];
}

export type Action = {
    type: "loading: data fetched";
    data: ElementModelAddress[];
} | {
    type: "loading: fetch error";
}

export interface AddressCluster {
    page: ElementPageId;
    names: string[];
}

export interface ModelPageContext {
    sendDelete: (address: ElementModelAddress, onSuccess?: () => void) => void;
    sendRename: (address: ElementModelAddress, newAddress: ElementModelAddress, onSuccess?: () => void) => void;
    sendAdd: (address: ElementModelAddress, onSuccess?: () => void) => void;
    sendEdit: (address: ElementModelAddress, model: Model, onSuccess?: () => void) => void;
}

export const ModelPageContext = React.createContext<ModelPageContext>({
    sendDelete: () => { return; },
    sendRename: () => { return; },
    sendAdd: () => { return; },
    sendEdit: () => { return; }
});