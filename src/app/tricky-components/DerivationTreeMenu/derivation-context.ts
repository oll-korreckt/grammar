import { DerivationTarget } from "@app/utils";
import { createContext } from "react";

export interface DerivationContext {
    onSelect: (target: DerivationTarget) => void;
}

export const DerivationContext = createContext<DerivationContext>({
    onSelect: () => { throw "not implemented"; }
});