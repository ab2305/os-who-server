const Coolsms = require('coolsms-rest-sdk')
const coolsmsConfig = require('config').coolsms

const coolsmsClient = new Coolsms({
	key: coolsmsConfig.apiKey,
	secret: coolsmsConfig.apiSecret
})

exports.send = (to, text, type) => {
	return new Promise((resolve, reject) => {
		const message = {
			to,
			from: coolsmsConfig.sender,
			type,
			text
		}

		return coolsmsClient.sms.send(message, (err, result) => {
			if (err) {
				return reject(err)
			}
			return resolve(result)
		})
	})
}
