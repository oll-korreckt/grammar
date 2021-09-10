import { withSplitClicks } from "@app/utils/hoc";
import { SplitClickOptions } from "@app/utils/hoc/withSplitClicks";
import { Dispatch } from "react";
import { WordViewProps } from "../WordView/WordView";
import { Action } from "./types";

export function createTemplateBuildFn(dispatch: Dispatch<Action>): NonNullable<WordViewProps["buildFn"]> {
    return (Component, data) => {
        let output = Component;
        if (data.type !== "word") {
            const options: SplitClickOptions = {
                singleClick: () => dispatch({
                    type: "wordViewContext: selectedItem",
                    selectedNode: {
                        id: data.id,
                        type: data.type,
                        state: "select"
                    }
                }),
                doubleClick: () => dispatch({
                    type: "wordViewContext: selectedItem",
                    selectedNode: {
                        id: data.id,
                        type: data.type,
                        state: "expand"
                    }
                }),
                threshold: 75,
                eventType: "click"
            };
            output = withSplitClicks(output, options);
        }
        return output;
    };
}