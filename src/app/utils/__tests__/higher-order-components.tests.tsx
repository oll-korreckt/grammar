import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { withClassName, makeRefComponent, withOnClick, withoutClassName } from "../higher-order-components";

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
            const WrappedComponent = withClassName(MockComponent, "hello1", "hello2");
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            const classNames: string[] = [];
            result.classList.forEach((value) => classNames.push(value));
            classNames.sort();
            const expected = ["hello1", "hello2"].sort();

            expect(classNames).toStrictEqual(expected);
        });

        test("multi call", () => {
            const WrappedComponent = withClassName(withClassName(MockComponent, "hello1"), "hello2");
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            const classNames: string[] = [];
            result.classList.forEach((value) => classNames.push(value));
            classNames.sort();
            const expected = ["hello1", "hello2"].sort();
            expect(classNames).toStrictEqual(expected);
        });
    });

    describe("withoutClassName", () => {
        const MockClassComponent = makeRefComponent<HTMLDivElement, { children: string; }>("MockClassComponent", ({ children }, ref) => {
            return <div ref={ref} className="class1 class2">{children}</div>;
        });
        test("remove 1", () => {
            const NoClassName = withoutClassName(MockClassComponent, "class1");
            const result = render(<NoClassName>NoClassName</NoClassName>).getByText("NoClassName");
            expect(result.classList).toContain("class2");
            expect(result.classList).not.toContain("class1");
        });

        test("remove 2", () => {
            const NoClassName = withoutClassName(MockClassComponent, "class1", "class2");
            const result = render(<NoClassName>NoClassName</NoClassName>).getByText("NoClassName");
            expect(result.classList).toHaveLength(0);
        });

        test("multi call", () => {
            const NoClassName = withoutClassName(withoutClassName(MockClassComponent, "class1"), "class2");
            const result = render(<NoClassName>NoClassName</NoClassName>).getByText("NoClassName");
            expect(result.classList).toHaveLength(0);
        });
    });
});