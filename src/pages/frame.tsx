import { useClientSide } from "@app/utils";
import { FramePage } from "@utils/frame/page/FramePage";
import { NextPage } from "next";
import React from "react";


const Frame: NextPage = () => {
    const client = useClientSide();
    return client
        ? <FramePage/>
        : null;
};

export default Frame;