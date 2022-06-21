import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.module.scss";
import { EditFormPlayer } from "@app/tricky-components/EditFormPlayer";

export const HomePage: React.VFC = () => {
    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "content")}>
                <h1>Software for diagramming the English language</h1>
                <p>Am I supposed to use <i>I</i> or <i>me</i>? When do I have to use <i>well</i> instead of <i>good</i>? Do I need to use a comma here or can I leave it alone?</p>
                <p>Many of us use our intuition when faced with these sorts of questions. In other words, we guess. Fortunately, these sorts of questions are oftentimes governed by formal rules and therefore do have objective answers. However many are deterred by the confusing terminology and the often interdependent rules of grammar.</p>
                <EditFormPlayer/>
            </div>
        </div>
    );
};