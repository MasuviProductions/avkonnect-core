import { APP } from '.';
import ENV from './constants/env';
import LOGGER from './utils/logger';

APP.listen(ENV.PORT, () => LOGGER.info(`Server listening on port ${ENV.PORT}`));
