import { NextApiResponse } from "next";
import { ElementPage, ElementPageId } from "@utils/element";
import nodepath from "path";
import { isModelLoaderError, ModelLoader } from "@utils/model/io";
import { ApiRequestHandler, createApiRequestHandler, ErrorMessage, sendError } from "@utils/api";
import { Model, ElementModelAddress } from "@utils/model";

function isError(value: ElementModelAddress | ElementPageId | ErrorMessage): value is ErrorMessage {
    return typeof value === "object" && "status" in value;
}

function createNotFound(page: string, model: string): string {
    return `Unable to find model for '${page}.${model}'`;
}

function getRouteData(path: string | string[] | undefined): ElementModelAddress | ElementPageId | ErrorMessage {
    if (path === undefined) {
        return { status: 400, msg: "Invalid query" };
    }
    const pathArray: string[] = typeof path === "string" ? [path] : path;
    switch (pathArray.length) {
        case 1: {
            const [page] = pathArray;
            return ElementPage.isPageId(page)
                ? page
                : { status: 400, msg: `'${page}' is not a page` };
        }
        case 2: {
            const [page, model] = pathArray;
            if (!ElementPage.isPageId(page)) {
                return {
                    status: 400,
                    msg: createNotFound(page, model)
                };
            }
            return { page, name: model };
        }
        default: {
            return {
                status: 400,
                msg: "Invalid query"
            };
        }
    }
}

const loader = ModelLoader.createLoader(nodepath.join(process.cwd(), "src", "data", "element"));

async function handleGet(address: ElementModelAddress | ElementPageId, res: NextApiResponse): Promise<void> {
    if (typeof address === "string") {
        const result = await loader.getModelAddresses(address);
        if (isModelLoaderError(result)) {
            sendError(res, 500, result.msg);
        } else {
            res.status(200).json(result);
        }
    } else {
        const result = await loader.getModel(address);
        if (!isModelLoaderError(result)) {
            res.status(200).json(result);
            return;
        }

        switch (result.errType) {
            case "internal error":
                sendError(res, 500, result.msg);
                break;
            case "invalid arg":
                sendError(res, 400, result.msg);
                break;
            case "resource not found":
                sendError(res, 404, result.msg);
                break;
        }
    }
}

type Handler = (model: ElementModelAddress | ElementPageId, res: NextApiResponse) => Promise<void>;

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

type HandlerWithBody = (model: ElementModelAddress | ElementPageId, body: string, res: NextApiResponse) => Promise<void>;

function _extendHandlerWithBody(handler: HandlerWithBody): ApiRequestHandler {
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

async function handlePut(address: ElementModelAddress | ElementPageId, modelBody: string, res: NextApiResponse): Promise<void> {
    if (typeof address === "string") {
        sendError(res, 400);
        return;
    }
    const model: Model = JSON.parse(modelBody);
    const result = await loader.updateModel(address, model);
    if (result === "success") {
        res.status(200).end();
        return;
    }
    switch (result.errType) {
        case "internal error":
            sendError(res, 500, result.msg);
            break;
        case "invalid arg":
            sendError(res, 400, result.msg);
            break;
        case "resource not found":
            sendError(res, 404, result.msg);
            break;
    }
}

async function handleDelete(address: ElementModelAddress | ElementPageId, res: NextApiResponse): Promise<void> {
    if (typeof address === "string") {
        sendError(res, 400);
        return;
    }
    const result = await loader.deleteModel(address);
    if (result === "success") {
        res.status(200).end();
        return;
    } else {
        sendError(res, 500, result.msg);
        return;
    }
}

async function handlePatch(address: ElementModelAddress | ElementPageId, newAddressBody: string, res: NextApiResponse): Promise<void> {
    if (typeof address === "string") {
        sendError(res, 400);
        return;
    }
    const newAddress = JSON.parse(newAddressBody);
    const result = await loader.renameModel(address, newAddress);
    if (result === "success") {
        res.status(200).end();
        return;
    }
    switch (result.errType) {
        case "resource conflict":
            sendError(res, 409, result.msg);
            break;
        case "invalid arg":
            sendError(res, 400, result.msg);
            break;
        case "internal error":
            sendError(res, 500, result.msg);
            break;
        case "resource not found":
            sendError(res, 404, result.msg);
            break;
    }
}

async function handlePost(address: ElementModelAddress | ElementPageId, modelBody: string, res: NextApiResponse): Promise<void> {
    if (typeof address === "string"
        || !ElementModelAddress.isValid(address)) {
        sendError(res, 400);
        return;
    }
    const model: Model | undefined = modelBody === "" ? undefined : JSON.parse(modelBody);
    const result = await loader.addModel(address, model);
    if (result === "success") {
        res.status(200).end();
        return;
    }
    switch (result.errType) {
        case "internal error":
            sendError(res, 500, result.msg);
            break;
        case "resource conflict":
            sendError(res, 409, result.msg);
            break;
    }
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
    deleteRequest: { handler: _extendHandler(handleDelete), devOnly: true },
    postRequest: {
        handler: _extendHandlerWithBody(handlePost),
        devOnly: true
    }
});
export default handler;