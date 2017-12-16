const moment = require('moment')
const winston = require('winston')
const logConfig = require('config').log

const transportConsole = new winston.transports.Console({
	timestamp: () => moment().format('YYYY/MM/DD HH:mm:ss'),
	json: false,
	level: logConfig.level,
	colorize: true
})

const logger = new winston.Logger({transports: [transportConsole]})

module.exports = logger
