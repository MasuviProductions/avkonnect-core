import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
// import { DBQueries } from '../utils/db/queries';

const getSampleJSON = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    res.status(200).json({ message: 'message', token: req.user });
};

const postSampleReq = async (req: Request, res: Response) => {
    if (req.body) {
        res.status(200).json({ body: true });
    }
};

const controller = {
    getSampleJSON: asyncHandler(getSampleJSON),
    postSampleReq: asyncHandler(postSampleReq),
};

export default controller;
