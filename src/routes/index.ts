import express from 'express';
import controller from '../controllers';

const { getSampleJSON, postSampleReq } = controller;

const ROUTER = express.Router();

ROUTER.route('').get(getSampleJSON);

ROUTER.route('/post').post(postSampleReq);

export default ROUTER;
