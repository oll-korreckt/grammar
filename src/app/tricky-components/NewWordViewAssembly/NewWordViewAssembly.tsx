import { DiagramState, WordViewMode } from "@app/utils";
import React, { useReducer } from "react";
import { WordViewNavBarAssembly } from "../WordViewNavBarAssembly";
import { convertToMenuProps, createEditActiveDispatch, createOnModeChange } from "./adapter";
import { useWordViewAssembly } from "./reducer";
import { DisplaySettings, NewWordViewAssemblyProps } from "./types";


export const NewWordViewAssembly: React.VFC<NewWordViewAssemblyProps> = (props) => {
    const [state, dispatch] = useWordViewAssembly(props);
    const onModeChange = createOnModeChange(state, dispatch);
    const menuProps = convertToMenuProps(state, dispatch);

    return (
        <WordViewNavBarAssembly
            mode={state.mode}
            onModeChange={onModeChange}
            props={menuProps}
        />
    );
};