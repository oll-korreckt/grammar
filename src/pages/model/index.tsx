import { useClientSide } from "@app/utils";
import { DisplayModelPage } from "@utils/model/components";
import { NextPage, GetStaticProps } from "next";
import React from "react";

const ModelPage: NextPage = () => {
    const client = useClientSide();
    return client
        ? <DisplayModelPage/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    if (process.env.NODE_ENV !== "development") {
        throw "Cannot access this page outside of development mode";
    }
    return { props: {} };
};

export default ModelPage;