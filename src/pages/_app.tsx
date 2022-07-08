import { useClientSide } from "@app/utils";
import { AppProps } from "next/app";
import React from "react";
import { Layout } from "utils/Layout";
import "../_globals.scss";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const client = useClientSide();
    if (client && process.env.NODE_ENV === "production") {
        console.log = () => { return; };
    }

    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;