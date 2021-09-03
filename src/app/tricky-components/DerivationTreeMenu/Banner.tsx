import { accessClassName } from "@app/utils";
import React from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import styles from "./_styles.scss";

interface BannerProps {
    children?: string;
    onBack?: () => void;
    onCancel?: () => void;
}

export const Banner: React.VFC<BannerProps> = ({ children, onBack, onCancel }) => {
    return (
        <div className={accessClassName(styles, "banner")}>
            {onBack &&
                <div
                    className={accessClassName(styles, "backColumn")}
                    onClick={() => onBack && onBack()}
                >
                    <FaArrowLeft/>
                </div>
            }
            <div className={accessClassName(styles, "textColumn")}>
                {children}
            </div>
            {onCancel &&
                <div
                    className={accessClassName(styles, "cancelColumn")}
                    onClick={() => onCancel && onCancel()}
                >
                    <FaTimes/>
                </div>
            }
        </div>
    );
};