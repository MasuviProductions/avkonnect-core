import { Request, Response } from 'express';

const getSampleJSON = (_req: Request, res: Response) => {
    res.status(200).json({ message: 'successfully deployed app to aws lambda' });
};

export default getSampleJSON;
