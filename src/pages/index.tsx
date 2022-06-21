import { useClientSide } from "@app/utils";
import { HomePage } from "@utils/home";
import { NextPage } from "next";
import React from "react";

const Home: NextPage = () => {
    const client = useClientSide();
    return client
        ? <HomePage/>
        : null;
};

export default Home;