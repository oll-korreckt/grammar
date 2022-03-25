import React from "react";
import Link from "next/link";
import styles from "./_styles.module.scss";
import { accessClassName } from "@app/utils";
import { FaHome, FaTree, FaQuestion, FaInfoCircle } from "react-icons/fa";
import { IconType } from "react-icons";

export const NavBar: React.VFC = () => {
    return (
        <nav className={accessClassName(styles, "navBar")}>
            <ul className={accessClassName(styles, "list")}>
                <li>
                    <NavBarItem
                        href="/"
                        icon={FaHome}
                    >
                        Home
                    </NavBarItem>
                </li>
                <li>
                    <NavBarItem
                        href="/app"
                        icon={FaTree}
                    >
                        App
                    </NavBarItem>
                </li>
                <li>
                    <NavBarItem
                        href="/element"
                        icon={FaQuestion}
                    >
                        Elements
                    </NavBarItem>
                </li>
                <li>
                    <NavBarItem
                        href="/"
                        icon={FaInfoCircle}
                    >
                        About
                    </NavBarItem>
                </li>
            </ul>
        </nav>
    );
};

interface NavBarItemProps {
    icon: IconType;
    href: string;
    children: string;
}

const NavBarItem: React.VFC<NavBarItemProps> = ({ icon, children, href }) => {
    const Icon = icon;
    return (
        <Link href={href}>
            <div className={accessClassName(styles, "navBarItem")}>
                <Icon className={accessClassName(styles, "navBarIcon")}/>
                <div className={accessClassName(styles, "navBarChildren")}>
                    {children}
                </div>
            </div>
        </Link>
    );
};