import { NextApiRequest, NextApiResponse } from "next";
import { ElementPage, ElementPageId } from "@utils/element";
import nodepath from "path";
import { ModelLoader } from "@utils/model/io";

interface RouteData {
    page: ElementPageId;
    model: string;
}

interface Error {
    status: number;
    msg: string;
}

function isError(value: RouteData | Error): value is Error {
    return "status" in value;
}

function createNotFound(page: string, model: string): string {
    return `Unable to find model for '${page}.${model}'`;
}

function getRouteData(path: string | string[]): RouteData | Error {
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
    return { page, model };
}

const loader = ModelLoader.createLoaderSync(nodepath.resolve("src", "markdown", "info", "elements"));

function sendError(res: NextApiResponse, error: Error): void {
    const { status, msg } = error;
    res.status(status).json({ message: msg });
}

export default async function(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const path = req.query.param;
    const route = getRouteData(path);
    if (isError(route)) {
        sendError(res, route);
        return;
    }
    const result = await loader(route.page, route.model);
    switch (result) {
        case "no model":
        case "invalid model":
            const err: Error = {
                status: 404,
                msg: `No model for ${route.page}/${route.model}`
            };
            sendError(res, err);
            break;
        default:
            res.status(200).json(result);
            break;
    }
}