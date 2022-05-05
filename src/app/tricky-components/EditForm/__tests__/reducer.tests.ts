import { InputFormErrorState } from "@app/tricky-components/InputForm";
import { DiagramState } from "@app/utils";
import { assert } from "chai";
import { Action, allowLabelSwitch, allowProceed, ProceedResult, reducer, EditFormInternalState, InputFormInternalState } from "../reducer";

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
        function runTest(before: EditFormInternalState, after: EditFormInternalState, action: Action): void {
            const result = reducer(before, action);
            assert.deepStrictEqual(result, after);
        }

        describe("stage switch", () => {
            test("input: ask to update", () => {
                runTest(
                    {
                        stage: "input",
                        inputState: {
                            initialValue: "the",
                            currentValue: "the dog"
                        },
                        labelState: {}
                    },
                    {
                        stage: "input",
                        inputState: {
                            initialValue: "the",
                            currentValue: "the dog",
                            askReplace: true
                        },
                        labelState: {}
                    },
                    { type: "stage switch" }
                );
            });
            test("input: go w/ update", () => {
                const result = reducer(
                    {
                        stage: "input",
                        inputState: {
                            initialValue: "",
                            currentValue: "the"
                        },
                        labelState: {}
                    },
                    { type: "stage switch" }
                );
                assert.deepStrictEqual(result.stage, "label");
                assert.deepStrictEqual(
                    result.inputState,
                    { initialValue: "the", currentValue: "the" }
                );
                assert.hasAllKeys(result.labelState, ["initialDiagram", "currentDiagram"]);
            });
            test("input: go w/o update", () => {
                const result = reducer(
                    {
                        stage: "input",
                        inputState: {
                            initialValue: "",
                            currentValue: "the"
                        },
                        labelState: {}
                    },
                    { type: "stage switch" }
                );
                assert.deepStrictEqual(result.stage, "label");
                assert.deepStrictEqual(
                    result.inputState,
                    { initialValue: "the", currentValue: "the" }
                );
                assert.hasAllKeys(result.labelState, ["initialDiagram", "currentDiagram"]);
            });
            test("label", () => {
                const newDiagram = DiagramState.fromText("the");
                const firstState: EditFormInternalState = {
                    stage: "label",
                    inputState: {
                        initialValue: "the",
                        currentValue: "the"
                    },
                    labelState: {
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
                    inputState: {
                        initialValue: "",
                        currentValue: ""
                    },
                    labelState: {}
                },
                {
                    stage: "input",
                    inputState: {
                        initialValue: "",
                        currentValue: value,
                        enableLabelSwitch: false
                    },
                    labelState: {}
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
                    inputState: {
                        initialValue: "dog",
                        currentValue: "new dog"
                    },
                    labelState: {}
                },
                {
                    stage: "input",
                    inputState: {
                        initialValue: "dog",
                        currentValue: "new dog",
                        askReplace: true
                    },
                    labelState: {}
                },
                { type: "input: enter ask replace" }
            );
        });

        test("input: accept replace", () => {
            const input: EditFormInternalState = {
                stage: "label",
                inputState: {
                    initialValue: "the",
                    currentValue: "the dog",
                    askReplace: true
                },
                labelState: {}
            };
            const result = reducer(input, { type: "input: accept replace" });
            const expectedInputStuff: InputFormInternalState = {
                initialValue: "the dog",
                currentValue: "the dog",
                askReplace: false
            };
            assert.deepStrictEqual(result.inputState, expectedInputStuff);
            assert.hasAllKeys(result.labelState, ["initialDiagram", "currentDiagram"]);
        });

        test("input: reject replace", () => {
            runTest(
                {
                    stage: "input",
                    inputState: {
                        initialValue: "the",
                        currentValue: "the dog",
                        askReplace: true
                    },
                    labelState: {}
                },
                {
                    stage: "input",
                    inputState: {
                        initialValue: "the",
                        currentValue: "the dog",
                        askReplace: false
                    },
                    labelState: {}
                },
                { type: "input: reject replace" }
            );
        });

        test("input: discard changes", () => {
            runTest(
                {
                    stage: "input",
                    inputState: {
                        initialValue: "the",
                        currentValue: "the dog",
                        askReplace: true
                    },
                    labelState: {}
                },
                {
                    stage: "input",
                    inputState: {
                        initialValue: "the",
                        currentValue: "the",
                        askReplace: false,
                        inputKey: "0"
                    },
                    labelState: {}
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
                    inputState: {
                        initialValue: "the dog",
                        currentValue: "the dog"
                    },
                    labelState: {
                        initialDiagram: oldDiagram,
                        currentDiagram: oldDiagram
                    }
                },
                {
                    stage: "label",
                    inputState: {
                        initialValue: "the dog",
                        currentValue: "the dog"
                    },
                    labelState: {
                        initialDiagram: oldDiagram,
                        currentDiagram: newDiagram
                    }
                },
                {
                    type: "label: update state",
                    diagram: newDiagram
                }
            );
        });
    });
});