import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useClientRect, useOutsideClick } from "../hooks";

const MockComponent: React.VFC<{ onClick: () => void; }> = ({ onClick }) => {
    const ref = useOutsideClick<HTMLDivElement>(onClick);
    return (
        <>
            <div ref={ref}>Inside click</div>
            <div>Outside click</div>
        </>
    );
};

const CRComponent: React.VFC = () => {
    const [rect, ref] = useClientRect<HTMLDivElement>();
    const text = rect === undefined ? undefined : `top: ${rect.top} left: ${rect.left}`;
    return <div data-testid="yo" ref={ref}>{text}</div>;
};

describe("hooks", () => {
    describe("useOutsideClick", () => {
        let callback: jest.Mock<void, []>;
        beforeEach(() => {
            callback = jest.fn(() => { return; });
        });

        test("inside click", () => {
            render(<MockComponent onClick={callback} />);
            fireEvent.mouseDown(screen.getByText(/inside/i));
            expect(callback).toBeCalledTimes(0);
        });

        test("outside click", () => {
            render(<MockComponent onClick={callback} />);
            fireEvent.mouseDown(screen.getByText(/outside/i));
            expect(callback).toBeCalledTimes(1);
        });
    });

    test("useClientRect", () => {
        const result = render(<CRComponent />).getByTestId("yo");
        expect(result.textContent).not.toBeUndefined();
    });
});