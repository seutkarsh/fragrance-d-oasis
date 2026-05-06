import { defineMiddlewares } from "@medusajs/framework/http";
import { NextFunction, Request, Response } from "express";

function preserveCustomQueryParams(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const locale = url.searchParams.get("locale");
    const region_id = url.searchParams.get("region_id");
    const slug = url.searchParams.get("slug");

    (req as any).customQuery = {
        ...(locale && { locale }),
        ...(region_id && { region_id }),
        ...(slug && {slug})
    };

    next();
}

export default defineMiddlewares({
    routes: [
        {
            matcher: "/store/custom/*",
            middlewares: [preserveCustomQueryParams],
        },
    ],
});