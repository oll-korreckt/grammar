import { accessClassName } from "@app/utils";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavBar } from "utils/NavBar";
import styles from "./_styles.module.scss";

const queryClient = new QueryClient();

export const Layout: React.FC = ({ children }) => {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <NavBar/>
                <main className={accessClassName(styles, "main")}>
                    {children}
                </main>
            </QueryClientProvider>
        </>
    );
};