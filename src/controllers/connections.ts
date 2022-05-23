import { Request, Response, NextFunction } from 'express';
import DBQueries from '../utils/db/queries';
import { asyncHandler } from '../middlewares';
import { HttpResponse } from '../interfaces/generic';

const getConnection = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const connectionId = req.params.connection_id;

    const connection = await DBQueries.getConnectionById(connectionId);

    const response: HttpResponse = {
        success: true,
        data: connection,
    };

    return res.status(200).send(response);
};

const CONNECTION_CONTROLLER = {
    getConnection: asyncHandler(getConnection),
};

export default CONNECTION_CONTROLLER;
