import React from "react";
import { render } from "@testing-library/react";
import { withClassContainer } from "..";

const MockComponent: React.VFC<{ children: string }> = ({ children }) => {
    return <span>{children}</span>;
};

describe("withClassContainer", () => {
    test("works", () => {
        const NewComponent = withClassContainer(MockComponent, "hello");
        const result = render(<NewComponent>Some text</NewComponent>);
        const child = result.getByText("Some text");
        expect(child).toBeDefined();
        const container = result.container.firstChild as HTMLDivElement;
        expect(container.className).toEqual("hello");
    });
});