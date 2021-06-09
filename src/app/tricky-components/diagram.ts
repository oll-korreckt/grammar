import { DiagramState } from "@app/utils";
import { Identifiable } from "@domain/language";
import { ElementId } from "@domain/language/element-id";
import { AtomicChange, ChangeMap, SimpleObject } from "@lib/utils";

export class Diagram {
    private baseState: DiagramState<Identifiable>;
    private newState: DiagramState<Identifiable> = {};
    private changes: AtomicChange[][] = [];
    private currentChange = 0;

    private constructor(baseState: DiagramState<Identifiable>) {
        this.baseState = baseState;
    }

    getCurrentItemState(id: ElementId): DiagramState<Identifiable>[keyof DiagramState<Identifiable>] {
        return {
            ...this.baseState[id],
            ...this.newState[id]
        };
    }

    stageChange(...change: AtomicChange[]): void {
        change.forEach((x) => {
            const id = x.key[0];
            this.transferData(id);
            this.newState = AtomicChange.apply(this.newState, x);
        });
        this.changes.splice(this.currentChange + 1);
        this.changes.push(change);
        this.currentChange = this.changes.length - 1;
    }

    private transferData(...ids: ElementId[]) {
        ids.forEach((id) => {
            if (!this.newState[id]) {
                this.newState[id] = SimpleObject.clone(this.baseState[id]);
            }
        });
    }

    undoChange(): void {
        if (!this.canUndo()) {
            throw "cannot perform undo";
        }
        const change = this.changes[this.currentChange];
        AtomicChange.applyInverse(this.newState, ...change);
        this.currentChange--;
    }

    canUndo(): boolean {
        return this.changes.length > 1 && this.currentChange > 0;
    }

    redoChange(): void {
        if (!this.canRedo()) {
            throw "cannot perform redo";
        }
        this.currentChange++;
        const change = this.changes[this.currentChange];
        AtomicChange.apply(this.newState, ...change);
    }

    canRedo(): boolean {
        return this.changes.length > 1
            && this.currentChange < this.changes.length - 1;
    }

    createChild(): Diagram {
        return new Diagram({ ...this.baseState, ...this.newState });
    }

    importState(state: Diagram): void {
        const map = ChangeMap.update(
            {},
            ...state.changes.slice(0, state.currentChange).flat()
        );
        const stateChanges = ChangeMap.getChanges(map, state.baseState, state.newState);
        this.stageChange(...stateChanges);
    }
}