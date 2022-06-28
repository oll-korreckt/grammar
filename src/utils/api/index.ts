import { Strings } from "@lib/utils";
import { NextApiRequest, NextApiResponse } from "next";
import catchAll from "pages/api/[[...404]]";


export interface ErrorMessage {
    status: 400 | 404 | 405;
    msg?: string;
}

export type ApiRequestHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export interface ApiRequestHandlerData {
    handler: ApiRequestHandler;
    devOnly?: boolean;
}

export interface ApiRequestHandlerObject {
    getRequest?: ApiRequestHandlerData | ApiRequestHandler;
    putRequest?: ApiRequestHandlerData | ApiRequestHandler;
    deleteRequest?: ApiRequestHandlerData | ApiRequestHandler;
    patchRequest?: ApiRequestHandlerData | ApiRequestHandler;
    postRequest?: ApiRequestHandlerData | ApiRequestHandler;
}

export function sendError(res: NextApiResponse, error: ErrorMessage): void
export function sendError(res: NextApiResponse, status: number, message?: string): void
export function sendError(res: NextApiResponse, errorOrStatus: ErrorMessage | number, message?: string): void {
    let status: number;
    let msg: string | undefined;
    if (typeof errorOrStatus === "number") {
        status = errorOrStatus;
        msg = message;
    } else {
        status = errorOrStatus.status;
        msg = errorOrStatus.msg;
    }
    res.status(status).send(msg);
}

async function execute(data: ApiRequestHandlerData | ApiRequestHandler | undefined, req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (data === undefined) {
        await catchAll(req, res);
        return;
    }
    if (typeof data === "function") {
        await data(req, res);
        return;
    }
    const { devOnly, handler } = data;
    if (devOnly && process.env.NODE_ENV !== "development") {
        await catchAll(req, res);
        return;
    }
    await handler(req, res);
}

export function createApiRequestHandler(reqObj: ApiRequestHandlerObject): ApiRequestHandler {
    return async (req, res) => {
        switch (req.method) {
            case "GET":
                await execute(reqObj.getRequest, req, res);
                break;
            case "PUT":
                await execute(reqObj.putRequest, req, res);
                break;
            case "DELETE":
                await execute(reqObj.deleteRequest, req, res);
                break;
            case "PATCH":
                await execute(reqObj.patchRequest, req, res);
                break;
            case "POST":
                await execute(reqObj.postRequest, req, res);
                break;
            default:
                sendError(res, 400, "Bad Request");
                break;
        }
    };
}

export function validAddressChars(addressStr: string): boolean {
    if (addressStr.length === 0) {
        return false;
    }
    for (let index = 0; index < addressStr.length; index++) {
        const char = addressStr[index];
        if (char === "_"
            || char === "-"
            || Strings.isEnglishLetterChar(char)
            || Strings.isNumericChar(char)) {
            continue;
        }
        return false;
    }
    return true;
}