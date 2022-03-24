import { AppProps } from "next/app";
import React from "react";
import { Layout } from "utils/Layout";
import "../_globals.scss";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;