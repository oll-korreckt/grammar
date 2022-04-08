import React from "react";
import { render, screen, fireEvent, RenderResult } from "@testing-library/react";
import { createLocalStorageHook, useClientRect, useOutsideClick } from "../hooks";
import { assert } from "chai";

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

interface Person {
    name: string;
    age: number;
}

function serialize(value: Person): string {
    return JSON.stringify(value);
}

function deserialize(value: string): Person {
    return JSON.parse(value);
}

const personSerializer = { serialize, deserialize };

const useStringLocalStorage = createLocalStorageHook("string");
const useDefStringLocalStorage = createLocalStorageHook("defString", "Default Value");
const useTypedLocalStorage = createLocalStorageHook<Person>("typed", personSerializer);
const useDefTypedLocalStorage = createLocalStorageHook<Person>("defTyped", personSerializer, { name: "Bob", age: 42 });


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

    describe("createLocalStorageHook", () => {
        interface TestResultUtils {
            updateClick: () => void;
            getValueText: () => string | null;
            resetClick: () => void;
            clearClick: () => void;
        }

        function getTestResultUtils(result: RenderResult): TestResultUtils {
            return {
                updateClick: () => fireEvent.click(result.getByTestId("update")),
                getValueText: () => result.getByTestId("value").textContent,
                resetClick: () => fireEvent.click(result.getByTestId("reset")),
                clearClick: () => fireEvent.click(result.getByTestId("clear"))
            };
        }

        beforeEach(() => localStorage.clear());

        describe("string", () => {
            const LocalStorageComponent: React.VFC = () => {
                const { value, update, clear, reset } = useStringLocalStorage();
                return (
                    <>
                        <p data-testid="value">
                            {value}
                        </p>
                        <button
                            data-testid="update"
                            onClick={() => {
                                if (value === undefined) {
                                    update("1");
                                    return;
                                }
                                let numVal = parseInt(value);
                                numVal++;
                                update(numVal.toString());
                            }}
                        >
                            Update
                        </button>
                        <button
                            data-testid="reset"
                            onClick={reset}
                        >
                            Reset
                        </button>
                        <button
                            data-testid="clear"
                            onClick={clear}
                        >
                            Clear
                        </button>
                    </>
                );
            };

            const getLocalStorage = () => localStorage.getItem("string");

            test("run", () => {
                const result = render(<LocalStorageComponent/>);
                const resultUtils = getTestResultUtils(result);

                assert.strictEqual(resultUtils.getValueText(), "");
                assert.strictEqual(getLocalStorage(), null);

                resultUtils.updateClick();
                assert.strictEqual(resultUtils.getValueText(), "1");
                assert.strictEqual(getLocalStorage(), "1");

                resultUtils.updateClick();
                assert.strictEqual(resultUtils.getValueText(), "2");
                assert.strictEqual(getLocalStorage(), "2");

                resultUtils.resetClick();
                assert.strictEqual(resultUtils.getValueText(), "");
                assert.strictEqual(getLocalStorage(), null);

                resultUtils.updateClick();
                resultUtils.clearClick();
                assert.strictEqual(resultUtils.getValueText(), "");
                assert.strictEqual(getLocalStorage(), null);
            });
        });

        describe("defString", () => {
            const LocalStorageComponent: React.VFC = () => {
                const { value, update, clear, reset } = useDefStringLocalStorage();
                return (
                    <>
                        <p data-testid="value">
                            {value}
                        </p>
                        <button
                            data-testid="update"
                            onClick={() => {
                                if (value === "Default Value") {
                                    update("1");
                                    return;
                                }
                                let numVal = parseInt(value);
                                numVal++;
                                update(numVal.toString());
                            }}
                        >
                            Update
                        </button>
                        <button
                            data-testid="reset"
                            onClick={reset}
                        >
                            Reset
                        </button>
                        <button
                            data-testid="clear"
                            onClick={clear}
                        >
                            Clear
                        </button>
                    </>
                );
            };

            const getLocalStorage = () => localStorage.getItem("defString");

            test("run", () => {
                const result = render(<LocalStorageComponent/>);
                const resultUtils = getTestResultUtils(result);

                assert.strictEqual(resultUtils.getValueText(), "Default Value");
                assert.strictEqual(getLocalStorage(), null);

                resultUtils.updateClick();
                assert.strictEqual(resultUtils.getValueText(), "1");
                assert.strictEqual(getLocalStorage(), "1");

                resultUtils.updateClick();
                assert.strictEqual(resultUtils.getValueText(), "2");
                assert.strictEqual(getLocalStorage(), "2");

                resultUtils.resetClick();
                assert.strictEqual(resultUtils.getValueText(), "Default Value");
                assert.strictEqual(getLocalStorage(), "Default Value");

                resultUtils.clearClick();
                assert.strictEqual(resultUtils.getValueText(), "Default Value");
                assert.strictEqual(getLocalStorage(), null);
            });
        });

        describe("typed", () => {
            const LocalStorageComponent: React.VFC = () => {
                const { value, update, reset, clear } = useTypedLocalStorage();
                return (
                    <>
                        <p data-testid="value">
                            {value
                                ? `Name: ${value.name}, Age: ${value.age}`
                                : "No Value"
                            }
                        </p>
                        <button
                            data-testid="update"
                            onClick={() => {
                                if (value === undefined) {
                                    update({ name: "Bob", age: 42 });
                                }
                            }}
                        >
                            Update
                        </button>
                        <button
                            data-testid="reset"
                            onClick={reset}
                        >
                            Reset
                        </button>
                        <button
                            data-testid="clear"
                            onClick={clear}
                        >
                            Clear
                        </button>
                    </>
                );
            };

            const getLocalStorage = () => localStorage.getItem("typed");

            test("run", () => {
                const result = render(<LocalStorageComponent/>);
                const resultUtils = getTestResultUtils(result);

                assert.strictEqual(resultUtils.getValueText(), "No Value");
                assert.strictEqual(getLocalStorage(), null);

                resultUtils.updateClick();
                assert.strictEqual(resultUtils.getValueText(), "Name: Bob, Age: 42");
                assert.strictEqual(getLocalStorage(), JSON.stringify({ name: "Bob", age: 42 }));

                resultUtils.resetClick();
                assert.strictEqual(resultUtils.getValueText(), "No Value");
                assert.strictEqual(getLocalStorage(), null);

                resultUtils.clearClick();
                assert.strictEqual(resultUtils.getValueText(), "No Value");
                assert.strictEqual(getLocalStorage(), null);
            });
        });

        describe("defTyped", () => {
            const LocalStorageComponent: React.VFC = () => {
                const { value, update, reset, clear } = useDefTypedLocalStorage();
                return (
                    <>
                        <p data-testid="value">
                            {`Name: ${value.name}, Age: ${value.age}`}
                        </p>
                        <button
                            data-testid="update"
                            onClick={() => update({ name: "Tim", age: 100 })}
                        >
                            Update
                        </button>
                        <button
                            data-testid="reset"
                            onClick={reset}
                        >
                            Reset
                        </button>
                        <button
                            data-testid="clear"
                            onClick={clear}
                        >
                            Clear
                        </button>
                    </>
                );
            };

            const getLocalStorage = () => localStorage.getItem("defTyped");

            test("run", () => {
                const result = render(<LocalStorageComponent/>);
                const resultUtils = getTestResultUtils(result);

                assert.strictEqual(resultUtils.getValueText(), "Name: Bob, Age: 42");
                assert.strictEqual(getLocalStorage(), null);

                resultUtils.updateClick();
                assert.strictEqual(resultUtils.getValueText(), "Name: Tim, Age: 100");
                assert.strictEqual(getLocalStorage(), JSON.stringify({ name: "Tim", age: 100 }));

                resultUtils.resetClick();
                assert.strictEqual(resultUtils.getValueText(), "Name: Bob, Age: 42");
                assert.strictEqual(getLocalStorage(), JSON.stringify({ name: "Bob", age: 42 }));

                resultUtils.clearClick();
                assert.strictEqual(resultUtils.getValueText(), "Name: Bob, Age: 42");
                assert.strictEqual(getLocalStorage(), null);
            });
        });
    });
});