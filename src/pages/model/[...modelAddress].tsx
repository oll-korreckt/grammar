import { useClientSide } from "@app/utils";
import { ElementModelAddress, Model } from "@utils/model";
import { EditModelPage } from "@utils/model/components";
import { SERVER } from "config";
import { GetServerSideProps, NextPage } from "next";
import React from "react";

interface ModelPageParams extends Record<string, string | string[]> {
    modelAddress: string[];
}

export const getServerSideProps: GetServerSideProps<ModelPageProps, ModelPageParams> = async ({ params }) => {
    if (params === undefined) {
        return {
            props: {
                error: "No address provided"
            }
        };
    }
    const { modelAddress } = params;
    if (!Array.isArray(modelAddress)) {
        return {
            props: {
                error: `Invalid address data-type. Received: ${typeof modelAddress}`
            }
        };
    }
    if (modelAddress.length !== 2) {
        return {
            props: {
                error: `Address should only contain 2 parts. Received: ${modelAddress.length}`
            }
        };
    }
    const [page, name] = modelAddress;
    const queryUrl = `${SERVER}/api/model/${page}/${name}`;
    const response = await fetch(queryUrl);
    if (!response.ok) {
        let errMsg = `An error occurred while trying to fetch data for '${page}.${name}'`;
        try {
            errMsg = await response.text();
        } catch {
        }
        return {
            props: {
                error: errMsg
            }
        };
    }
    const model: Model = await response.json();
    const address: ElementModelAddress = { page, name } as any;
    return {
        props: { model, address }
    };
};

interface ModelPageProps {
    error?: string;
    address?: ElementModelAddress;
    model?: Model;
}

const ModelPage: NextPage<ModelPageProps> = ({ error, address, model }) => {
    const client = useClientSide();
    if (!client) {
        return null;
    }
    if (error !== undefined) {
        return <Error>{error}</Error>;
    }
    if (address === undefined || model === undefined) {
        return <Error>Error: Model + Address not provided</Error>;
    }
    return (
        <EditModelPage address={address}>
            {model}
        </EditModelPage>
    );
};

const Error: React.VFC<{ children: string; }> = ({ children }) => {
    return (
        <p
            style={{
                color: "red"
            }}
        >
            {children}
        </p>
    );
};

export default ModelPage;