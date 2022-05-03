import { useClientSide } from "@app/utils";
import { ModelPage } from "@utils/model/components/ModelPage";
import { ModelPageState } from "@utils/model/components/types";
import { NextPage, GetStaticProps } from "next";
import React from "react";

const Output: NextPage = () => {
    const client = useClientSide();
    if (!client) {
        return null;
    }
    const state: ModelPageState = {
        type: "data",
        data: [
            {
                page: "adjective",
                names: [
                    "hello",
                    "What the heck"
                ]
            },
            {
                page: "adjective-phrase",
                names: []
            }
        ]
    };
    return (
        <ModelPage/>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    if (process.env.NODE_ENV !== "development") {
        throw "Cannot access this page outside of development mode";
    }
    return { props: {} };
};

export default Output;