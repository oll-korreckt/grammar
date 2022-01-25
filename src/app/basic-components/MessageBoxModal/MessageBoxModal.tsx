import React from "react";
import { MessageBox, MessageBoxResponse, MessageBoxType } from "../MessageBox/MessageBox";
import { ModalBackdrop } from "../ModalBackdrop";

export interface MessageBoxModalProps {
    type: MessageBoxType;
    children: string;
    onResponse?: (response: MessageBoxModalResponse) => void;
}

export type MessageBoxModalResponse = MessageBoxResponse | "off screen click";

export const MessageBoxModal: React.VFC<MessageBoxModalProps> = ({ type, children, onResponse }) => {
    function invokeResponse(response: MessageBoxModalResponse): void {
        if (onResponse) {
            onResponse(response);
        }
    }

    return (
        <ModalBackdrop onClick={() => invokeResponse("off screen click")}>
            <MessageBox
                type={type}
                onResponse={(response) => invokeResponse(response)}
            >
                {children}
            </MessageBox>
        </ModalBackdrop>
    );
};