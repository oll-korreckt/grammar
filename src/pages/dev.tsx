import { Development } from "@app/development";
import { useClientSide } from "@app/utils";
import { NextPage, GetStaticProps } from "next";
import React from "react";

const DevPage: NextPage = () => {
    const client = useClientSide();
    return client
        ? <Development/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {},
        notFound: process.env.NODE_ENV !== "development"
    };
};

export default DevPage;