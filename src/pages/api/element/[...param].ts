import { NextApiRequest, NextApiResponse } from "next";
import { ElementPage, ElementPageType } from "utils/elements/types";
import { HTMLObject } from "@lib/utils";
import { ElementPageLoader } from "utils/elements/io";

export type ElementRouteType =
    | "info"
    | "page";

interface ElementRouteData {
    route: ElementRouteType;
    page: ElementPageType;
}

interface Error {
    status: number;
    msg: string;
}

function isError(value: ElementRouteData | Error): value is Error {
    return "status" in value;
}

function isElementRouteType(value: string): value is ElementRouteType {
    switch (value) {
        case "info":
        case "page":
            return true;
        default:
            return false;
    }
}

function getRouteData(path: string | string[]): ElementRouteData | Error {
    const pathArray: string[] = typeof path === "string" ? [path] : path;
    if (pathArray.length !== 2) {
        return {
            status: 400,
            msg: ""
        };
    }
    const [route, pageId] = pathArray;
    if (!isElementRouteType(route)) {
        return {
            status: 400,
            msg: ""
        };
    }
    if (!ElementPage.isPageId(pageId)) {
        return {
            status: 400,
            msg: ""
        };
    }
    const pageType = ElementPage.idToType(pageId);
    return { route: route, page: pageType };
}

export default async function(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const path = req.query.param;
    const routeData = getRouteData(path);
    if (isError(routeData)) {
        res.status(routeData.status).send(routeData.msg);
        return;
    }
    let body: HTMLObject | HTMLObject[];
    switch (routeData.route) {
        case "page":
            body = await ElementPageLoader.loadPage(routeData.page);
            break;
        case "info":
            body = await ElementPageLoader.loadInfo(routeData.page);
            break;
    }
    res.status(200).json(body);
}