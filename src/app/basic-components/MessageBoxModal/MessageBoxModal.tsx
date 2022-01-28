import React from "react";
import { MessageBox, MessageBoxButton } from "../MessageBox/MessageBox";
import { ModalBackdrop } from "../ModalBackdrop";

export interface MessageBoxModalProps {
    buttons: MessageBoxButton[];
    children: string;
    onResponse?: (response: MessageBoxModalResponse) => void;
}

export type MessageBoxModalResponse = {
    type: "off screen click";
} | {
    type: "button";
    text: string;
}

export const MessageBoxModal: React.VFC<MessageBoxModalProps> = ({ buttons, children, onResponse }) => {
    function invokeResponse(response: MessageBoxModalResponse): void {
        if (onResponse) {
            onResponse(response);
        }
    }

    return (
        <ModalBackdrop onClick={() => invokeResponse({ type: "off screen click" })}>
            <MessageBox
                buttons={buttons}
                onButtonClick={(text) => invokeResponse({ type: "button", text })}
            >
                {children}
            </MessageBox>
        </ModalBackdrop>
    );
};