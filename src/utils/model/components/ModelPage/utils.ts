import { ElementPage, ElementPageId } from "@utils/element";
import { ElementModelAddress } from "@utils/model";
import { AddressCluster } from "../types";

type Holder = Record<string, string[]>;

function addAddress(holder: Holder, address: ElementModelAddress): void {
    const { page, name } = address;
    if (!(page in holder)) {
        holder[page] = [];
    }
    const items = holder[page];
    items.push(name);
}

export function getAddressClusters(addresses: ElementModelAddress[]): AddressCluster[] {
    const data: Holder = {};
    addresses.forEach((address) => addAddress(data, address));
    const output: AddressCluster[] = [];
    Object.entries(data).forEach(([page, names]) => {
        names.sort();
        output.push({
            page: page as ElementPageId,
            names
        });
    });
    output.sort((a, b) => ElementPage.sortPageIds(a.page, b.page));
    return output;
}