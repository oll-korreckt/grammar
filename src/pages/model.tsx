import { useClientSide } from "@app/utils";
import { ModelPage } from "@utils/model/ModelPage";
import { NextPage, GetStaticProps } from "next";
import React from "react";

const Output: NextPage = () => {
    const client = useClientSide();
    return client ? <ModelPage/> : null;
};

export const getStaticProps: GetStaticProps = async () => {
    if (process.env.NODE_ENV !== "development") {
        throw "Cannot access this page outside of development mode";
    }
    return { props: {} };
};

export default Output;