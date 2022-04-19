import { EditForm } from "@app/tricky-components/EditForm";
import { useClientSide } from "@app/utils";
import { NextPage, GetStaticProps } from "next";
import React from "react";

const AppPage: NextPage = () => {
    const client = useClientSide();
    return client
        ? <EditForm/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    return { props: {} };
};

export default AppPage;