/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const Device = require('../models').Device

const router = express.Router()

router.put('/me/device', auth.needsLogin, async (req, res) => {
	let device

	if (req.user.email) {
		device = await Device.findOne({where: {userId: req.user.id}})
	}
	if (req.user.code) {
		device = await Device.findOne({where: {inviteeId: req.user.id}})
	}

	await device.update(_.pick(req.body, ['useVibrate', 'usePush', 'useSound']))

	res.send(device.toJSON())
})

router.get('/me/device', auth.needsLogin, async (req, res) => {
	let device

	if (req.user.email) {
		device = await Device.findOne({where: {userId: req.user.id}})

		if (!device) {
			device = await Device.create({userId: req.user.id})
		}
	}
	if (req.user.code) {
		device = await Device.findOne({where: {inviteeId: req.user.id}})

		if (!device) {
			device = await Device.create({inviteeId: req.user.id})
		}
	}

	res.send(device.toJSON())
})

module.exports = router
