import { Request, Response } from 'express';

const getSampleJSON = (_req: Request, res: Response) => {
    res.status(200).json({ message: 'successfully deployed app to aws lambda!' });
};

interface IUser {
    user: string;
    password: string;
}

const postSampleReq = (req: Request, res: Response) => {
    if (req.body as IUser) {
        res.status(200).json({ body: true });
    }
};

export { getSampleJSON, postSampleReq };
