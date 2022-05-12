import { RenderFragment } from "@app/basic-components/HTMLObjectRender/elements";
import { accessClassName } from "@app/utils";
import { HTMLBlockquoteObject } from "@lib/utils";
import React from "react";
import { FaPlusCircle } from "react-icons/fa";
import styles from "./_styles.module.scss";

export interface ExampleBlockquoteClosedProps {
    children: HTMLBlockquoteObject;
    onOpen: () => void;
}

export const ExampleBlockquoteClosed: React.VFC<ExampleBlockquoteClosedProps> = ({ children, onOpen }) => {
    const { content } = children;
    return (
        <blockquote className={accessClassName(styles, "displayContent")}>
            <RenderFragment>
                {content}
            </RenderFragment>
            <div className={accessClassName(styles, "buttonContainer")}>
                <FaPlusCircle onClick={onOpen}/>
            </div>
        </blockquote>
    );
};