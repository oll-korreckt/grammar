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
                error: "Hello"
            }
        };
    }
    const { modelAddress } = params;
    if (!Array.isArray(modelAddress)) {
        return {
            props: {
                error: "Hello"
            }
        };
    }
    if (modelAddress.length !== 2) {
        return {
            props: {
                error: "Hello"
            }
        };
    }
    const [page, name] = modelAddress;
    const queryUrl = `${SERVER}/api/model/${page}/${name}`;
    const response = await fetch(queryUrl);
    if (!response.ok) {
        return {
            props: {
                error: "Hello"
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
        return <>{error}</>;
    }
    if (address === undefined || model === undefined) {
        return <>Error: Model + Address not provided</>;
    }
    return (
        <EditModelPage address={address}>
            {model}
        </EditModelPage>
    );
};

export default ModelPage;