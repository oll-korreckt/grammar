import { NextApiRequest, NextApiResponse } from "next";


export default async function catchAll(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    res.status(404).send("404: Not found");
}