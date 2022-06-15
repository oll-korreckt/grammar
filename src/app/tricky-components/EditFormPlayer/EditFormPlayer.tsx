import { Frame } from "@utils/frame";
import React, { useEffect, useState } from "react";
import { EditFormFrameRender } from "../EditFormFrameRender";

export interface EditFormPlayerProps {
    children: Frame[];
}

export const EditFormPlayer: React.VFC<EditFormPlayerProps> = ({ children }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const { duration } = children[index];
        const defDuration = duration ? duration : 1.5;
        const nextIndex = index === children.length - 1
            ? 0
            : index + 1;
        setTimeout(() => setIndex(nextIndex), defDuration * 1000);
    }, [index, children]);

    const { data } = children[index];

    return (
        <EditFormFrameRender {...data}/>
    );
};