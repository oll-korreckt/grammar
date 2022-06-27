import { createApiRequestHandler } from "@utils/api";
import { Frame } from "@utils/frame";
import { FrameError, FrameLoader } from "@utils/frame/io";
import { NextApiRequest, NextApiResponse } from "next";
import nodepath from "path";

const loader = FrameLoader.createLoader(nodepath.resolve("src", "data", "frame"));

async function handlePost(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { query, body } = req;
    if (!("name" in query)) {
        res.status(400).send("Invalid parameter received");
        return;
    }
    const name = query.name;
    if (typeof name !== "string") {
        res.status(400).send("Invalid parameter received");
        return;
    }
    const frame: Frame = JSON.parse(body);
    const result = await loader.postFrame(name, frame);
    if (FrameError.isFrameError(result)) {
        let errorCode: number;
        switch (result.errType) {
            case "argument error":
                errorCode = 400;
                break;
            case "internal error":
                errorCode = 500;
                break;
            case "resource conflict":
                errorCode = 409;
                break;
        }
        res.status(errorCode).send(result.msg);
        return;
    }
    res.status(200).json(result);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { query } = req;
    if (!("name" in query)) {
        res.status(400).send("Invalid parameter received");
        return;
    }
    const name = query.name;
    if (typeof name !== "string") {
        res.status(400).send("Invalid parameter received");
        return;
    }
    const frames = await loader.getFrames(name);
    if (FrameError.isFrameError(frames)) {
        let errorCode: number;
        switch (frames.errType) {
            case "internal error":
                errorCode = 500;
                break;
            case "resource not found":
                errorCode = 404;
                break;
        }
        res.status(errorCode).send(frames.msg);
        return;
    }
    res.status(200).json(frames);
}

const requestHandler = createApiRequestHandler({
    postRequest: { handler: handlePost, devOnly: true },
    getRequest: { handler: handleGet }
});
export default requestHandler;