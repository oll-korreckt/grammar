import { ElementModelAddress } from "@utils/model";
import React from "react";

export interface ModelPageContext {
    sendDelete: (address: ElementModelAddress, onSuccess?: () => void) => void;
    sendRename: (address: ElementModelAddress, newAddress: ElementModelAddress, onSuccess?: () => void) => void;
    sendAdd: (address: ElementModelAddress, onSuccess?: () => void) => void;
    enterEdit: (address: ElementModelAddress) => void;
}

export const ModelPageContext = React.createContext<ModelPageContext>({
    sendDelete: () => { return; },
    sendRename: () => { return; },
    sendAdd: () => { return; },
    enterEdit: () => { return; }
});