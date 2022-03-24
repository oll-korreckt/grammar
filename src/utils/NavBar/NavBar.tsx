import React from "react";
import Link from "next/link";
import styles from "./_styles.module.scss";
import { accessClassName } from "@app/utils";

export const NavBar: React.VFC = () => {
    return (
        <nav className={accessClassName(styles, "navBar")}>
            <ul className={accessClassName(styles, "list")}>
                <li>
                    <Link href="/">
                        Home
                    </Link>
                </li>
                <li>
                    <Link href="/app">
                        App
                    </Link>
                </li>
                <li>
                    <Link href="/element">
                        Elements
                    </Link>
                </li>
            </ul>
        </nav>
    );
};