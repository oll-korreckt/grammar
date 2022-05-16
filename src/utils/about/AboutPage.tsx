import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.module.scss";


export const AboutPage: React.VFC = () => {
    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "content")}>
                <h1>Hello</h1>
            </div>
        </div>
    );
};