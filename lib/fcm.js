const Fcm = require('fcm-push')
const fcmConfig = require('config').fcm
const logger = require('./logger')

const fcm = new Fcm(fcmConfig.serverKey)

exports.send = function (topic, request) {
	const message = {
		to: `/topics/${topic}`,
		priority: 'high',
		notification: request.notification,
		data: request.data
	}

	return new Promise((resolve, reject) => {
		fcm.send(message, (err, response) => {
			if (err) {
				logger.error(err)
				return reject(err)
			}
			return resolve(response)
		})
	})
}
