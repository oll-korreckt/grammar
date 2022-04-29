import { NextApiResponse } from "next";
import { ElementPage } from "@utils/element";
import nodepath from "path";
import { ElementModelAddress, ModelLoader } from "@utils/model/io";
import { ApiRequestHandler, createApiRequestHandler, ErrorMessage, sendError } from "@utils/api";
import { Model } from "@utils/model";

function isError(value: ElementModelAddress | ErrorMessage): value is ErrorMessage {
    return "status" in value;
}

function createNotFound(page: string, model: string): string {
    return `Unable to find model for '${page}.${model}'`;
}

function getRouteData(path: string | string[] | undefined): ElementModelAddress | ErrorMessage {
    if (path === undefined) {
        return { status: 400, msg: "Invalid query" };
    }
    const pathArray: string[] = typeof path === "string" ? [path] : path;
    if (pathArray.length !== 2) {
        return {
            status: 400,
            msg: "Invalid query"
        };
    }
    const [page, model] = pathArray;
    if (!ElementPage.isPageId(page)) {
        return {
            status: 400,
            msg: createNotFound(page, model)
        };
    }
    return { page, name: model };
}

const loader = ModelLoader.createLoader(nodepath.resolve("src", "data", "element"));

async function handleGet(address: ElementModelAddress, res: NextApiResponse): Promise<void> {
    const result = await loader.getModel(address);
    switch (result) {
        case "no model":
        case "error":
            const err: ErrorMessage = {
                status: 404,
                msg: `No model for ${address.page}: ${address.name}`
            };
            sendError(res, err);
            break;
        default:
            res.status(200).json(result);
            break;
    }
}

type Handler = (model: ElementModelAddress, res: NextApiResponse) => Promise<void>;

function _extendHandler(handler: Handler): ApiRequestHandler {
    return async (req, res) => {
        const path = req.query.param;
        const route = getRouteData(path);
        if (isError(route)) {
            sendError(res, route);
            return;
        }
        await handler(route, res);
    };
}

type HandlerWithBody<TBody> = (model: ElementModelAddress, body: TBody, res: NextApiResponse) => Promise<void>;

function _extendHandlerWithBody<TBody>(handler: HandlerWithBody<TBody>): ApiRequestHandler {
    return async (req, res) => {
        const path = req.query.param;
        const route = getRouteData(path);
        if (isError(route)) {
            sendError(res, route);
            return;
        }
        await handler(route, req.body, res);
    };
}

async function handlePut(address: ElementModelAddress, model: Model, res: NextApiResponse): Promise<void> {
    const result = await loader.setModel(address, model);
    switch (result) {
        case "success":
            res.status(200).end();
            break;
        case "error":
            break;
    }
}

async function handleDelete(address: ElementModelAddress, res: NextApiResponse): Promise<void> {
    const result = await loader.deleteModel(address);
    switch (result) {
        case "success":
            res.status(200).end();
            return;
        case "error":
            sendError(res, { status: 404 });
            break;
    }
    res.end();
    return;
}

async function handlePatch(address: ElementModelAddress, newAddress: ElementModelAddress, res: NextApiResponse): Promise<void> {
    const result = await loader.renameModel(address, newAddress);
    switch (result) {
        case "success":
            res.status(200).end();
            break;
        case "error":
            sendError(res, 500);
            break;
        case "invalid arg":
            sendError(res, 400);
            break;
        case "not found":
            sendError(res, 404);
            break;
    }
    throw "not handled";
}

const handler = createApiRequestHandler({
    getRequest: _extendHandler(handleGet),
    putRequest: {
        handler: _extendHandlerWithBody(handlePut),
        devOnly: true
    },
    patchRequest: {
        handler: _extendHandlerWithBody(handlePatch),
        devOnly: true
    },
    deleteRequest: { handler: _extendHandler(handleDelete), devOnly: true }
});
export default handler;