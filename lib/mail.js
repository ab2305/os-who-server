const nodemailer = require('nodemailer')
const mailConfig = require('config').mail

const transporter = nodemailer.createTransport({
	host: mailConfig.host,
	port: 465,
	secure: true,
	auth: {
		user: mailConfig.user,
		pass: mailConfig.password
	}
})

exports.send = (to, subject, text) => {
	const mailOptions = {
		from: `"누굴까" <${mailConfig.user}>`,
		to,
		subject,
		text
	}

	return new Promise((resolve, reject) => {
		return transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return reject(error)
			}
			console.log('Message %s sent: %s', info.messageId, info.response)
			return resolve(info)
		})
	})
}
