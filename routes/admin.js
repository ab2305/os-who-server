/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const Admin = require('../models').Admin
const User = require('../models').User

const router = express.Router()

router.post('/admin', auth.needsAdmin, async (req, res) => {
	if (!req.body.userId) {
		return res.status(400).send('No userId in request body')
	}
	const user = await User.findOne({where: {id: req.body.userId}})

	if (!user) {
		return res.status(404).send('Not found user')
	}

	try {
		await Admin.create({userId: user.id})
	} catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			return res.status(409).send('already created')
		}
	}

	return res.status(201).end()
})

router.get('/admins', auth.needsAdmin, async (req, res) => {
	const admins = await Admin.findAll({
		order: [['id', 'desc']],
		include: [
			{model: User, as: 'user'}
		]
	})

	return res.json(admins.map(o => {
		return _.chain(o.toJSON())
		.extend({
			user: o.user.toRes()
		})
		.value()
	}))
})

router.delete('/admins/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const admin = await Admin.findOne({where: {id}})

	if (!admin) {
		return res.status(404).send('Not found admin')
	}

	await admin.destroy()

	return res.status(200).end()
})

module.exports = router
