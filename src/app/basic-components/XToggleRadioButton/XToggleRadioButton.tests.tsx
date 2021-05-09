import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { XToggleRadioButton } from "./XToggleRadioButton";
import { XToggleButton } from "../XToggleButton";

const TestXToggleButton: typeof XToggleButton = (props) => {
    const text = props.showX ? `${props.children} [*]` : props.children;
    return <div
        onClick={() => props.onClick && props.onClick(props.children)}>{text}</div>;
};

describe("XToggleRadioButton", () => {
    describe("good inputs", () => {
        test("no initial item", () => {
            const onItemCancel = jest.fn();
            const onItemSelect = jest.fn();
            const result = render(
                <XToggleRadioButton
                    onItemCancel={onItemCancel}
                    onItemSelect={onItemSelect}
                >
                    {[
                        [TestXToggleButton, "Option1"],
                        [TestXToggleButton, "Option2"],
                        [TestXToggleButton, "Option3"]
                    ]}
                </XToggleRadioButton>
            );
            // All children rendered
            let children = result.getAllByText(/option/i);
            expect(children.length).toBe(3);
            // click
            let option3 = result.getByText("Option3");
            fireEvent.click(option3);
            // only Option3
            children = result.getAllByText(/option/i);
            expect(children.length).toBe(1);
            // Option3 has x
            option3 = result.getByText("Option3 [*]");
            expect(option3).toBeDefined();
            // check events
            expect(onItemCancel).toBeCalledTimes(0);
            expect(onItemSelect).toBeCalledTimes(1);
        });

        test("initial item", () => {
            const onItemCancel = jest.fn();
            const onItemSelect = jest.fn();
            const result = render(
                <XToggleRadioButton
                    initialItem="Option2"
                    onItemSelect={onItemSelect}
                    onItemCancel={onItemCancel}
                >
                    {[
                        [TestXToggleButton, "Option1"],
                        [TestXToggleButton, "Option2"],
                        [TestXToggleButton, "Option3"]
                    ]}
                </XToggleRadioButton>
            );
            // just 1 child
            let children = result.getAllByText(/option/i);
            expect(children.length).toBe(1);
            const x = result.getByText(/\*/);
            expect(x).toBeDefined();
            // Click on child
            fireEvent.click(x);
            // multiple children
            children = result.getAllByText(/option/i);
            expect(children.length).toBe(3);
            const xElements = result.queryAllByText(/\[\*\]/);
            expect(xElements.length).toBe(0);
            // onItemCancel called
            expect(onItemCancel).toBeCalledTimes(1);
            expect(onItemSelect).toBeCalledTimes(0);
        });
    });

    describe("bad inputs", () => {
        beforeEach(() => spyOn(console, "error"));

        test("not unique", () => {
            const action = () => {
                render(
                    <XToggleRadioButton>
                        {[
                            [TestXToggleButton, "hi"],
                            [TestXToggleButton, "hi"]
                        ]}
                    </XToggleRadioButton>
                );
            };
            expect(action).toThrow(/unique/i);
        });

        test("< 2 child items", () => {
            const action = () => {
                render(<XToggleRadioButton>{[]}</XToggleRadioButton>);
            };
            expect(action).toThrow(/2 child items/i);
        });

        test("bad initialItem", () => {
            expect(() => {
                render(
                    <XToggleRadioButton initialItem="bob">
                        {[
                            [TestXToggleButton, "yo"],
                            [TestXToggleButton, "hi"]
                        ]}
                    </XToggleRadioButton>
                );
            }).toThrow(/initialItem property/i);
        });
    });
});