import React from "react";
import { FaTimesCircle } from "react-icons/fa";
import styles from "./_styles.scss";

export interface XToggleButtonProps {
    children: string;
    onClick?: (text: string) => void;
    showX?: boolean;
}

export const XToggleButton: React.VFC<XToggleButtonProps> = ({showX = true, ...props}) => {
    return (
        <div className={styles.xToggleButton} onClick={() => props.onClick && props.onClick(props.children)}>
            <div className={styles.text}>
                {props.children}
            </div>
            {showX &&
                <div className={styles.xIcon}>
                    <FaTimesCircle />
                </div>
            }
        </div>
    );
};