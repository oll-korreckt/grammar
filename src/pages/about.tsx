import { useClientSide } from "@app/utils";
import { AboutPage } from "@utils/about/AboutPage";
import { GetStaticProps, NextPage } from "next";
import React from "react";

const About: NextPage = () => {
    const client = useClientSide();
    return client
        ? <AboutPage/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    return { props: {} };
};

export default About;