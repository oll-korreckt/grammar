import { RefComponent, withEventListener } from "./higher-order-components";

type Listener = () => void;
type EventType = "click" | "mousedown" | "mouseup";

let handle: ReturnType<typeof setTimeout>;
let clickedElement: HTMLElement | null = null;
let prevSingleClick: Listener | null = null;


function createOnClick<TElement extends HTMLElement, TEvent extends EventType>(type: TEvent, threshold: number, singleClick: Listener, doubleClick: Listener): Listener {
    function onClick(this: TElement): void {
        if (clickedElement === null) {
            // setup wait for
            clickedElement = this;
            prevSingleClick = singleClick;
            handle = setTimeout(() => {
                // cleanup
                clickedElement = null;
                // invoke
                singleClick();
            }, threshold);
        } else if (clickedElement === this) {
            // cleanup
            clearTimeout(handle);
            clickedElement = null;
            // invoke
            doubleClick();
        } else {
            /*
                User clicked an element once and then clicked a different
                element before the timer expired
            */
            // clear handle and invoke the singleClick from the previous element
            clearTimeout(handle);
            if (prevSingleClick === null) {
                throw "No previous single click function to call";
            }
            prevSingleClick();
            // setup wait for
            clickedElement = this;
            prevSingleClick = singleClick;
            handle = setTimeout(() => {
                // cleanup
                clickedElement = null;
                // invoke
                singleClick();
            }, threshold);
        }
    }

    return onClick;
}

export type SplitClickOptions = {
    singleClick: Listener;
    doubleClick: Listener;
    /**@default "click"*/
    eventType?: Extract<keyof HTMLElementEventMap, "click" | "mousedown" | "mouseup">;
    /**@default 200 */
    threshold?: number;
}

export function withSplitClicks<TElement extends HTMLElement, TProps>(Component: RefComponent<TElement, TProps>, { singleClick, doubleClick, eventType = "click", threshold = 200 }: SplitClickOptions): RefComponent<TElement, TProps> {
    const onClick = createOnClick(eventType, threshold, singleClick, doubleClick);
    return withEventListener(Component, eventType, onClick);
}