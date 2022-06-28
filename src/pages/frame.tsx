import { useClientSide } from "@app/utils";
import { FramePage } from "@utils/frame/page/FramePage";
import { GetStaticProps, NextPage } from "next";
import React from "react";


const Frame: NextPage = () => {
    const client = useClientSide();
    return client
        ? <FramePage/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {},
        notFound: process.env.NODE_ENV !== "development"
    };
};

export default Frame;