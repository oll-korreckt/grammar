import { ElementId, WordTag } from "@domain/language";
import { AtomicChange, ChangeMap, SimpleObject } from "@lib/utils";
import { scan } from "@domain/language";
import { DiagramState, LinkType } from "@app/utils";

export class Diagram {
    static fromSentence(sentence: string): Diagram {
        const baseState: DiagramState<WordTag> = {};
        let wordCnt = 0;
        scan(sentence).forEach(({ lexeme, tokenType }) => {
            if (tokenType === "word") {
                const value: WordTag = {
                    id: `1.${wordCnt}`,
                    lexeme: lexeme
                };
                baseState[value.id] = {
                    value: value,
                    links: {}
                };
                wordCnt++;
            }
        });
        return new Diagram(baseState);
    }

    private baseState: DiagramState<WordTag>;
    private newState: DiagramState<WordTag> = {};
    private changes: AtomicChange[][] = [[]];
    private currentChange = 0;

    private constructor(baseState: DiagramState<WordTag>) {
        this.baseState = baseState;
    }

    getCurrentElement(id: ElementId): DiagramState<WordTag>[keyof DiagramState<WordTag>] {
        return this.newState[id] ? this.newState[id] : this.baseState[id];
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

    addLink(reference: ElementId, target: ElementId): void {
        this.transferData(reference, target);
        const referenceChange = AtomicChange.createSet(
            [reference, "links", target],
            this.newState[reference].links[target],
            LinkType.Target
        );
        const targetChange = AtomicChange.createSet(
            [target, "links", reference],
            this.newState[target].links[reference],
            LinkType.Reference
        );
        this.stageChange(referenceChange, targetChange);
    }

    removeLink(reference: ElementId, target: ElementId): void {
        this.transferData(reference, target);
        const removeRef = AtomicChange.createRemove(
            [reference, "links", target],
            this.newState[reference].links[target]
        );
        const removeTarget = AtomicChange.createRemove(
            [target, "links", reference],
            this.newState[target].links[reference]
        );
        this.stageChange(removeRef, removeTarget);
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

    private getCurrentState(): DiagramState<WordTag> {
        return { ...this.baseState, ...this.newState };
    }

    createChild(): Diagram {
        return new Diagram(this.getCurrentState());
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