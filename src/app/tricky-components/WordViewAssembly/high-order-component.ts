/* eslint-disable @typescript-eslint/ban-types */
import { makeRefHoc, RefComponent } from "@app/utils/hoc";

export function withPropertyHeader<TElement extends HTMLElement, TProps = {}>(Component: RefComponent<TElement, TProps>, propertyHeader: string): RefComponent<TElement, TProps> {
    return makeRefHoc(Component, "withPropertyHeader", (_, element) => {
        const header = element.querySelector("#headLabel") as HTMLElement | null;
        if (header === null) {
            throw "header does not exist";
        }
        header.textContent += ` (${propertyHeader})`;
        return header.style.width = `${element.getBoundingClientRect().width}px`;
    });
}