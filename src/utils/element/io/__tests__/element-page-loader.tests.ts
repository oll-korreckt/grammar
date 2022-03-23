import { ElementPageLoader } from "../element-page-loader";

describe("ElementPageLoader", () => {
    test("loadPage", async () => {
        await ElementPageLoader.loadPage("verbPhrase");
    });

    test("loadInfo", async () => {
        await ElementPageLoader.loadInfo("verbPhrase");
    });
});