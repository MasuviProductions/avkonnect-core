import express from 'express';
import CONNECTION_CONTROLLER from '../controllers/connections';

const CONNECTION_ROUTER = express.Router();
CONNECTION_ROUTER.route('/:connection_id').get(CONNECTION_CONTROLLER.getConnection);

export default CONNECTION_ROUTER;
