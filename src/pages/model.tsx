import { useClientSide } from "@app/utils";
import { ElementModelAddress } from "@utils/model";
import { DisplayModelPage, EditModelPage } from "@utils/model/components";
import { NextPage, GetStaticProps } from "next";
import React, { useReducer } from "react";

const ModelPage: NextPage = () => {
    const client = useClientSide();
    return client
        ? <ModelPageComponent/>
        : null;
};

export const getStaticProps: GetStaticProps = async () => {
    if (process.env.NODE_ENV !== "development") {
        throw "Cannot access this page outside of development mode";
    }
    return { props: {} };
};

type State = {
    type: "display";
} | {
    type: "edit";
    address: ElementModelAddress;
}

type Action = {
    type: "enter display";
} | {
    type: "enter edit";
    address: ElementModelAddress;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "enter display":
            return { type: "display" };
        case "enter edit":
            return { type: "edit", address: action.address };
    }
}

const ModelPageComponent: React.VFC = () => {
    const [state, dispatch] = useReducer(reducer, { type: "display" });

    switch (state.type) {
        case "display":
            return (
                <DisplayModelPage
                    enterEdit={(address) => dispatch({ type: "enter edit", address })}
                />
            );
        case "edit":
            return (
                <EditModelPage
                    exitEdit={() => dispatch({ type: "enter display" })}
                >
                    {state.address}
                </EditModelPage>
            );
    }
};

export default ModelPage;