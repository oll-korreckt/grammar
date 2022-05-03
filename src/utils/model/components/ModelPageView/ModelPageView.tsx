import { accessClassName } from "@app/utils";
import { ElementPage } from "@utils/element";
import React, { useContext } from "react";
import { PageCluster } from "../PageCluster";
import { Action, AddressCluster, ModelPageContext, ModelPageState } from "../types";
import styles from "./_styles.module.scss";

export interface ModelPageViewProps {
    state?: ModelPageState;
    dispatch?: React.Dispatch<Action>;
}

function fillData(partialData: AddressCluster[]): AddressCluster[] {
    const holder = Object.fromEntries(partialData.map((cluster) => [cluster.page, cluster]));
    const pages = ElementPage.getAllPageIds();
    return pages.map((page) => {
        const output: AddressCluster = page in holder
            ? holder[page]
            : { page, names: [] };
        return output;
    });
}

export const ModelPageView: React.VFC<ModelPageViewProps> = ({ state, dispatch }) => {
    const { sendAdd } = useContext(ModelPageContext);
    const defState: ModelPageState = state !== undefined
        ? state
        : { type: "data", data: [] };

    function invokeDispatch(action: Action): void {
        if (dispatch) {
            dispatch(action);
        }
    }

    if (defState.type === "initial") {
        return <></>;
    }

    const data = fillData(defState.data);
    return (
        <div className={accessClassName(styles, "modelPageView")}>
            {defState.type === "data" &&
                data.map((cluster) => {
                    return (
                        <PageCluster
                            key={cluster.page}
                        >
                            {cluster}
                        </PageCluster>
                    );
                })
            }
        </div>
    );
};