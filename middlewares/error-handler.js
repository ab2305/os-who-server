/* eslint no-unused-vars: 0 */

const _ = require('lodash')
const logger = require('../lib/logger')

module.exports = (response, expressReq, expressRes, next) => {
	if (!response.isError) {
		logger.error(response)
		expressRes.status(500).send('Internal Server Error').end()
		return
	}

	const res = expressRes
	.status(response.status)
	.set(response.header)

	if (_.isString(response.body)) {
		res.send(response.body)
		return
	}

	res.json(response.body)
}
