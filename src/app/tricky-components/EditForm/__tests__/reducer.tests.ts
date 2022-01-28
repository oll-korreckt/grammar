import { InputFormErrorState } from "@app/tricky-components/InputForm";
import { DiagramState } from "@app/utils";
import { assert } from "chai";
import { Action, allowLabelSwitch, allowProceed, InputStuff, ProceedResult, reducer, State } from "../reducer";

describe("reducer", () => {
    test("allowLabelSwitch", () => {
        function runTest(currentValue: string, errorState: InputFormErrorState, expected: boolean): void {
            const result = allowLabelSwitch(currentValue, errorState);
            assert.strictEqual(result, expected);
        }

        runTest("", "none", false);
        runTest("hello", "calculating", false);
        runTest("hello", "errors", false);
        runTest("hello", "none", true);
    });

    describe("allowProceed", () => {
        function runTest(initialValue: string, currentValue: string, expected: ProceedResult): void {
            const result = allowProceed(initialValue, currentValue);
            assert.strictEqual(result, expected);
        }

        test("go w/ update", () => {
            runTest("", "hi", "go w/ update");
        });

        test("go w/o update", () => {
            runTest("hello", "hello", "go w/o update");
        });

        test("ask to update", () => {
            runTest("hello", "goodbye", "ask to update");
        });
    });

    describe("reducer", () => {
        function runTest(before: State, after: State, action: Action): void {
            const result = reducer(before, action);
            assert.deepStrictEqual(result, after);
        }

        describe("stage switch", () => {
            test("input: ask to update", () => {
                runTest(
                    {
                        stage: "input",
                        inputStuff: {
                            initialValue: "the",
                            currentValue: "the dog"
                        },
                        labelStuff: {}
                    },
                    {
                        stage: "input",
                        inputStuff: {
                            initialValue: "the",
                            currentValue: "the dog",
                            askReplace: true
                        },
                        labelStuff: {}
                    },
                    { type: "stage switch" }
                );
            });
            test("input: go w/ update", () => {
                const result = reducer(
                    {
                        stage: "input",
                        inputStuff: {
                            initialValue: "",
                            currentValue: "the"
                        },
                        labelStuff: {}
                    },
                    { type: "stage switch" }
                );
                assert.deepStrictEqual(result.stage, "label");
                assert.deepStrictEqual(
                    result.inputStuff,
                    { initialValue: "the", currentValue: "the" }
                );
                assert.hasAllKeys(result.labelStuff, ["initialDiagram", "currentDiagram"]);
            });
            test("input: go w/o update", () => {
                const result = reducer(
                    {
                        stage: "input",
                        inputStuff: {
                            initialValue: "",
                            currentValue: "the"
                        },
                        labelStuff: {}
                    },
                    { type: "stage switch" }
                );
                assert.deepStrictEqual(result.stage, "label");
                assert.deepStrictEqual(
                    result.inputStuff,
                    { initialValue: "the", currentValue: "the" }
                );
                assert.hasAllKeys(result.labelStuff, ["initialDiagram", "currentDiagram"]);
            });
            test("label", () => {
                const newDiagram = DiagramState.fromText("the");
                const firstState: State = {
                    stage: "label",
                    inputStuff: {
                        initialValue: "the",
                        currentValue: "the"
                    },
                    labelStuff: {
                        initialDiagram: newDiagram,
                        currentDiagram: newDiagram
                    }
                };
                runTest(
                    firstState,
                    {
                        ...firstState,
                        stage: "input"
                    },
                    { type: "stage switch" }
                );
            });
        });

        test("input: update state", () => {
            const value = "hello";
            runTest(
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "",
                        currentValue: ""
                    },
                    labelStuff: {}
                },
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "",
                        currentValue: value,
                        enableLabelSwitch: false
                    },
                    labelStuff: {}
                },
                {
                    type: "input: update state",
                    value: value,
                    errorState: "calculating"
                }
            );
        });

        test("input: enter ask replace", () => {
            runTest(
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "dog",
                        currentValue: "new dog"
                    },
                    labelStuff: {}
                },
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "dog",
                        currentValue: "new dog",
                        askReplace: true
                    },
                    labelStuff: {}
                },
                { type: "input: enter ask replace" }
            );
        });

        test("input: accept replace", () => {
            const input: State = {
                stage: "label",
                inputStuff: {
                    initialValue: "the",
                    currentValue: "the dog",
                    askReplace: true
                },
                labelStuff: {}
            };
            const result = reducer(input, { type: "input: accept replace" });
            const expectedInputStuff: InputStuff = {
                initialValue: "the dog",
                currentValue: "the dog",
                askReplace: false
            };
            assert.deepStrictEqual(result.inputStuff, expectedInputStuff);
            assert.hasAllKeys(result.labelStuff, ["initialDiagram", "currentDiagram"]);
        });

        test("input: reject replace", () => {
            runTest(
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "the",
                        currentValue: "the dog",
                        askReplace: true
                    },
                    labelStuff: {}
                },
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "the",
                        currentValue: "the dog",
                        askReplace: false
                    },
                    labelStuff: {}
                },
                { type: "input: reject replace" }
            );
        });

        test("input: discard changes", () => {
            runTest(
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "the",
                        currentValue: "the dog",
                        askReplace: true
                    },
                    labelStuff: {}
                },
                {
                    stage: "input",
                    inputStuff: {
                        initialValue: "the",
                        currentValue: "the",
                        askReplace: false
                    },
                    labelStuff: {}
                },
                { type: "input: discard changes" }
            );
        });

        test("label: update diagram", () => {
            const oldDiagram = DiagramState.fromText("the dog");
            const newDiagram = DiagramState.fromText("the dog");
            runTest(
                {
                    stage: "label",
                    inputStuff: {
                        initialValue: "the dog",
                        currentValue: "the dog"
                    },
                    labelStuff: {
                        initialDiagram: oldDiagram,
                        currentDiagram: oldDiagram
                    }
                },
                {
                    stage: "label",
                    inputStuff: {
                        initialValue: "the dog",
                        currentValue: "the dog"
                    },
                    labelStuff: {
                        initialDiagram: oldDiagram,
                        currentDiagram: newDiagram
                    }
                },
                {
                    type: "label: update diagram",
                    diagram: newDiagram
                }
            );
        });
    });
});