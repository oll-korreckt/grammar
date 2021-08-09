import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { withClassName, makeRefComponent, withoutClassName, withEventListener } from "../higher-order-components";

const MockComponent = makeRefComponent<HTMLDivElement, { children: string; }>("MockComponent", ({ children }, ref) => {
    return <div ref={ref}>{children}</div>;
});

describe("higher-order-components", () => {
    describe("withEventListener", () => {
        test("with 1", () => {
            const callback = jest.fn(() => { return; });
            const WrappedComponent = withEventListener(MockComponent, "mousedown", callback);
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            fireEvent(result, new MouseEvent("mousedown"));
            expect(callback).toBeCalledTimes(1);
        });

        test("with 2", () => {
            const callback1 = jest.fn(() => { return; });
            const callback2 = jest.fn(() => { return; });
            const WrappedComponent = withEventListener(withEventListener(MockComponent, "click", callback1), "mouseover", callback2);
            const result = render(<WrappedComponent>Some text</WrappedComponent>).getByText("Some text");
            fireEvent(result, new MouseEvent("click"));
            expect(callback1).toBeCalledTimes(1);
            expect(callback2).toBeCalledTimes(0);
            fireEvent(result, new MouseEvent("mouseover"));
            expect(callback1).toBeCalledTimes(1);
            expect(callback2).toBeCalledTimes(1);
        });
    });

    describe("withClassName", () => {
        describe("classNames", () => {
            test("with 0", () => {
                expect(() => withClassName(MockComponent)).toThrow(/at least 1/i);
            });

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

        describe("function", () => {
            test("standard", () => {
                const WrappedComponent = withClassName(MockComponent, ({ children }) => { return children === "hello" ? ["hi"] : ["goodbye"]; });
                const result = render(
                    <>
                        <WrappedComponent>hello</WrappedComponent>
                        <WrappedComponent>something</WrappedComponent>
                    </>
                );
                expect(result.getByText("hello").className).toStrictEqual("hi");
                expect(result.getByText("something").className).toStrictEqual("goodbye");
            });
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