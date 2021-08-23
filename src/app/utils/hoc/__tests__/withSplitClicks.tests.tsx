import React from "react";
import { makeRefComponent } from "../higher-order-components";
import { withSplitClicks } from "../withSplitClicks";
import { render, fireEvent } from "@testing-library/react";

const Button = makeRefComponent<HTMLButtonElement, { children: string; }>("Button", ({ children }, ref) => <button ref={ref}>{children}</button>);
const emptyFn = () => { return; };
const click = new MouseEvent("click");

describe("withSplitClicks", () => {
    test("single click", () => {
        const singleClick = jest.fn(emptyFn);
        const doubleClick = jest.fn(emptyFn);
        const Component = withSplitClicks(
            Button,
            {
                singleClick: singleClick,
                doubleClick: doubleClick
            }
        );
        const result = render(<Component>Click</Component>).getByText("Click");
        fireEvent(result, click);
        expect(singleClick).toBeCalledTimes(0);
        expect(doubleClick).toBeCalledTimes(0);
        setTimeout(() => {
            expect(singleClick).toBeCalledTimes(1);
            expect(doubleClick).toBeCalledTimes(0);
        }, 300);
    });

    test("double click", () => {
        const singleClick = jest.fn(emptyFn);
        const doubleClick = jest.fn(emptyFn);
        const Component = withSplitClicks(
            Button,
            {
                singleClick: singleClick,
                doubleClick: doubleClick
            }
        );
        const result = render(<Component>Click</Component>).getByText("Click");
        fireEvent(result, click);
        fireEvent(result, click);
        expect(singleClick).toBeCalledTimes(0);
        expect(doubleClick).toBeCalledTimes(1);
        setTimeout(() => {
            expect(singleClick).toBeCalledTimes(0);
            expect(doubleClick).toBeCalledTimes(1);
        }, 300);
    });

    test("single click diff elements", () => {
        const singleClick1 = jest.fn(emptyFn);
        const doubleClick1 = jest.fn(emptyFn);
        const singleClick2 = jest.fn(emptyFn);
        const doubleClick2 = jest.fn(emptyFn);
        const Component1 = withSplitClicks(
            Button,
            {
                singleClick: singleClick1,
                doubleClick: doubleClick1
            }
        );
        const Component2 = withSplitClicks(
            Button,
            {
                singleClick: singleClick2,
                doubleClick: doubleClick2
            }
        );
        const { getByText } = render(
            <>
                <Component1>Element 1</Component1>
                <Component2>Element 2</Component2>
            </>
        );
        const result1 = getByText("Element 1");
        const result2 = getByText("Element 2");
        fireEvent(result1, click);
        fireEvent(result2, click);
        expect(singleClick1).toBeCalledTimes(1);
        expect(doubleClick1).toBeCalledTimes(0);
        expect(singleClick2).toBeCalledTimes(0);
        expect(doubleClick2).toBeCalledTimes(0);
        setTimeout(() => {
            expect(singleClick1).toBeCalledTimes(1);
            expect(doubleClick1).toBeCalledTimes(0);
            expect(singleClick2).toBeCalledTimes(1);
            expect(doubleClick2).toBeCalledTimes(0);
        }, 300);
    });

    test("single click one element, double click another", () => {
        const singleClick1 = jest.fn(emptyFn);
        const doubleClick1 = jest.fn(emptyFn);
        const singleClick2 = jest.fn(emptyFn);
        const doubleClick2 = jest.fn(emptyFn);
        const Component1 = withSplitClicks(
            Button,
            {
                singleClick: singleClick1,
                doubleClick: doubleClick1
            }
        );
        const Component2 = withSplitClicks(
            Button,
            {
                singleClick: singleClick2,
                doubleClick: doubleClick2
            }
        );
        const { getByText } = render(
            <>
                <Component1>Element 1</Component1>
                <Component2>Element 2</Component2>
            </>
        );
        const result1 = getByText("Element 1");
        const result2 = getByText("Element 2");
        fireEvent(result1, click);
        fireEvent(result2, click);
        fireEvent(result2, click);
        expect(singleClick1).toBeCalledTimes(1);
        expect(doubleClick1).toBeCalledTimes(0);
        expect(singleClick2).toBeCalledTimes(0);
        expect(doubleClick2).toBeCalledTimes(1);
        setTimeout(() => {
            expect(singleClick1).toBeCalledTimes(1);
            expect(doubleClick1).toBeCalledTimes(0);
            expect(singleClick2).toBeCalledTimes(0);
            expect(doubleClick2).toBeCalledTimes(1);
        }, 300);
    });
});