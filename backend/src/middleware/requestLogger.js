const morgan = require('morgan');
const config = require('../config/env');

const format = config.nodeEnv === 'production' ? 'combined' : 'dev';
const requestLogger = morgan(format);

module.exports = requestLogger;
