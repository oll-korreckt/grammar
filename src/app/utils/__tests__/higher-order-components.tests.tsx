import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { withClassName, makeRefComponent, withOnClick } from "../higher-order-components";

const MockComponent = makeRefComponent<HTMLDivElement, { children: string; }>("MockComponent", ({ children }, ref) => {
    return <div ref={ref}>{children}</div>;
});

describe("higher-order-components", () => {
    describe("withOnClick", () => {
        test("with 1", () => {
            const callback = jest.fn(() => { return; });
            const WrappedComponent = withOnClick(MockComponent, callback);
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            fireEvent(result, new MouseEvent("click"));
            expect(callback).toBeCalledTimes(1);
        });

        test("with 2", () => {
            const callback1 = jest.fn(() => { return; });
            const callback2 = jest.fn(() => { return; });
            const WrappedComponent = withOnClick(withOnClick(MockComponent, callback1), callback2);
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            fireEvent(result, new MouseEvent("click"));
            expect(callback1).toBeCalledTimes(1);
            expect(callback2).toBeCalledTimes(1);
        });
    });

    describe("withClassName", () => {
        test("with 1", () => {
            const WrappedComponent = withClassName(MockComponent, "hello");
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            expect(result.className).toBe("hello");
        });

        test("with 2", () => {
            const WrappedComponent = withClassName(withClassName(MockComponent, "hello2"), "hello1");
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            const classNames: string[] = [];
            result.classList.forEach((value) => classNames.push(value));
            classNames.sort();
            const expected = ["hello1", "hello2"].sort();

            expect(classNames).toStrictEqual(expected);
        });
    });
});