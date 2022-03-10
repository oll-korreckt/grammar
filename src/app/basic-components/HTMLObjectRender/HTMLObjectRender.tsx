import React from "react";
import { RenderFragment } from "./elements";
import { HTMLObjectRenderContext, HTMLObjectRenderProps } from "./types";


export const HTMLObjectRender: React.VFC<HTMLObjectRenderProps> = ({ children, ...passThrough }) => {
    return (
        <HTMLObjectRenderContext.Provider value={passThrough}>
            <RenderFragment>
                {children}
            </RenderFragment>
        </HTMLObjectRenderContext.Provider>
    );
};