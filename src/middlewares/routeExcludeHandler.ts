import { Method } from 'axios';
import { RequestHandler } from 'express';
import { pathToRegexp, Path } from 'path-to-regexp';

const routeExcludeHandler = (methods: Method[], paths: Path, middleware: RequestHandler): RequestHandler => {
    const regex = pathToRegexp(paths);
    return (req, res, next) =>
        regex.exec(req.url) && methods.includes(req.method as Method) ? next() : middleware(req, res, next);
};

export default routeExcludeHandler;
