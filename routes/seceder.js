/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const connection = require('../models').connection
const User = require('../models').User
const Seceder = require('../models').Seceder

const router = express.Router()

router.post('/seceder', auth.needsUserLogin, async (req, res, next) => {
	let seceder

	const t = await connection.transaction()
	// Transaction starting
	req.body.userCreatedAt = req.user.createdAt
	try {
		const pickList = ['email', 'name', 'nickname', 'gender', 'birthYear', 'phone', 'verified', 'userCreatedAt']

		seceder = await Seceder.create(_.pick(req.user, pickList), {transaction: t})
		const user = await User.findOne({where: {id: req.user.id}})
		await user.destroy({transaction: t})
		await t.commit()
	} catch (err) {
		console.log(err)
		await t.rollback()
		return next(err)
	}
	// Transaction ending

	return res.status(201).json({id: seceder.id})
})

router.get('/seceders', auth.needsAdmin, async (req, res) => {
	const seceders = await Seceder.findAll({
		order: [['id', 'desc']]
	})

	return res.json(seceders.map(o => o.toJSON()))
})

router.get('/seceders/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const seceder = await Seceder.findOne({
		where: {id}
	})

	return res.json(seceder.toJSON())
})

module.exports = router
