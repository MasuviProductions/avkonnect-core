import { Request, Response } from 'express';

const getSampleJSON = (_req: Request, res: Response) => {
    res.status(200).json({ message: 'success' });
};

export default getSampleJSON;
