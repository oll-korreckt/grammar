import { ChangeMap } from "@app/tricky-components/change-map";
import { AtomicChange, SimpleObject } from "@lib/utils";

export interface HistoryState<T extends SimpleObject> {
    baseState: T;
    currState: T;
    changes: AtomicChange[][];
    changeMaps: ChangeMap[];
    currChange?: number;
}

function init<T>(baseState: T): HistoryState<T> {
    return {
        baseState: baseState,
        currState: SimpleObject.clone(baseState),
        changes: [],
        changeMaps: []
    };
}

function _getChangeMap<T>(state: HistoryState<T>): ChangeMap {
    if (state.currChange !== undefined) {
        return state.changeMaps[state.currChange];
    }
    return {};
}

function stageChange<T>(state: HistoryState<T>, ...change: AtomicChange[]): HistoryState<T> {
    let currState = state.currState;
    let currChangeMap = _getChangeMap(state);
    change.forEach((x) => {
        currChangeMap = ChangeMap.update(
            currChangeMap,
            x.key,
            x.type
        );
        currState = AtomicChange.apply(currState, x);
    });
    const currChange = state.currChange;
    if (currChange !== undefined) {
        const filterFn = (_: any, index: number) => index <= currChange;
        const changes = state.changes.filter(filterFn);
        const changeMaps = state.changeMaps.filter(filterFn);
        changes.push(change);
        changeMaps.push(currChangeMap);
        return {
            ...state,
            currState: currState,
            changes: changes,
            changeMaps: changeMaps,
            currChange: currChange + 1
        };
    } else {
        return {
            ...state,
            currState: currState,
            changes: [change],
            changeMaps: [currChangeMap],
            currChange: 0
        };
    }
}

function canUndo<T>(state: HistoryState<T>): boolean {
    return state.currChange !== undefined;
}

function undoChange<T>(state: HistoryState<T>): HistoryState<T> {
    if (!canUndo(state) || state.currChange === undefined) {
        throw "cannot perform undo";
    }
    const change = state.changes[state.currChange];
    return {
        ...state,
        currState: AtomicChange.applyInverse(state.currState, ...change),
        currChange: state.currChange > 0 ? state.currChange - 1 : undefined
    };
}

function canRedo<T>(state: HistoryState<T>): boolean {
    if (state.currChange !== undefined) {
        return state.currChange < state.changes.length - 1;
    }
    return state.changes.length > 0;
}

function redoChange<T>(state: HistoryState<T>): HistoryState<T> {
    if (!canRedo(state)) {
        throw "cannot perform redo";
    }
    if (state.currChange !== undefined) {
        const change = state.changes[state.currChange + 1];
        return {
            ...state,
            currState: AtomicChange.apply(state.currState, ...change),
            currChange: state.currChange + 1
        };
    } else {
        const change = state.changes[0];
        return {
            ...state,
            currState: AtomicChange.apply(state.currState, ...change),
            currChange: 0
        };
    }
}

function createChild<T>(state: HistoryState<T>): HistoryState<T> {
    return init(state.currState);
}

function importChild<T>(state: HistoryState<T>, child: HistoryState<T>): HistoryState<T> {
    const change = ChangeMap.extractChanges(
        _getChangeMap(child),
        child.baseState,
        child.currState
    );
    return stageChange(state, ...change);
}

export const HistoryState = {
    init: init,
    stageChange: stageChange,
    canUndo: canUndo,
    undoChange: undoChange,
    canRedo: canRedo,
    redoChange: redoChange,
    createChild: createChild,
    importChild: importChild
};