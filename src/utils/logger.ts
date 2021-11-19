import log from 'loglevel';
import ENV from '../constants/env';

log.enableAll();
if (ENV.DEPLOYMENT_ENV === 'prod') {
    log.disableAll();
}

const LOGGER = {
    info: (msg: string): void => log.info(`[INFO]: ${msg}`),
    warn: (msg: string): void => log.warn(`[WARN]: ${msg}`),
    danger: (msg: string): void => log.info(`[DANGER]: ${msg}`),
};

export default LOGGER;
