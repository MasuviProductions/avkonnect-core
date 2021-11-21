import express from 'express';
import { getSampleJSON, postSampleReq } from '../controllers';

const ROUTER = express.Router();

ROUTER.route('').get(getSampleJSON);

ROUTER.route('/post').post(postSampleReq);

export default ROUTER;
