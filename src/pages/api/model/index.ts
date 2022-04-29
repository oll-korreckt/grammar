import { createApiRequestHandler, sendError } from "@utils/api";
import { ModelLoader } from "@utils/model/io";
import { NextApiRequest, NextApiResponse } from "next";
import nodepath from "path";

const loader = ModelLoader.createLoader(nodepath.resolve("src", "data", "element"));

async function handleGet(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const output = await loader.getModelAddresses();
    if (output === "error") {
        sendError(res, 400);
        return;
    }
    res.status(200).json(output);
    return;
}

const requestHandler = createApiRequestHandler({
    getRequest: { handler: handleGet, devOnly: true }
});
export default requestHandler;