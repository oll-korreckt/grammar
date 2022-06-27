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
    return {
        props: {},
        notFound: process.env.NODE_ENV !== "development"
    };
};

export default ModelPage;