import express from 'express';
import getSampleJSON from '../controllers';

const ROUTER = express.Router();

ROUTER.route('').get(getSampleJSON);

export default ROUTER;
