import { accessClassName } from "@app/utils";
import React from "react";
import { NavBar } from "utils/NavBar";
import styles from "./_styles.module.scss";

export const Layout: React.FC = ({ children }) => {
    return (
        <>
            <NavBar/>
            <main className={accessClassName(styles, "main")}>
                {children}
            </main>
        </>
    );
};