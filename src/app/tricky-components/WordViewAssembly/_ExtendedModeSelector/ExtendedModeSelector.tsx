import { ModeSelector, ModeSelectorProps } from "@app/basic-components/ModeSelector";
import { accessClassName, DiagramStateContext } from "@app/utils";
import React, { useContext } from "react";
import styles from "./_styles.scss";

export const ExtendedModeSelector: React.FC<ModeSelectorProps> = ({ children, ...rest }) => {
    const { progress } = useContext(DiagramStateContext);
    const percentage = progress.category.percentage * 0.4 + progress.syntax.percentage * 0.6;
    const clippedPct = percentage === 0 ? 0.5 : percentage;
    const pctClassNames = ["percentage"];
    if (clippedPct < 100) {
        pctClassNames.push("roundedEdges");
    }

    return (
        <div>
            {children}
            <div className={accessClassName(styles, "modeSelectorBar")}>
                <div className={accessClassName(styles, "progress")}>
                    <div
                        style={{ width: `${clippedPct}%` }}
                        className={accessClassName(styles, ...pctClassNames)}
                    >
                    </div>
                </div>
                <ModeSelector {...rest}/>
            </div>
        </div>
    );
};