import { HTMLObject } from "@lib/utils";
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

export interface HTMLObjectRenderChildProps {
    children?: HTMLObject | HTMLObject[];
}

export const HTMLObjectRenderChild: React.VFC<HTMLObjectRenderChildProps> = ({ children }) => (
    <RenderFragment>
        {children}
    </RenderFragment>
);