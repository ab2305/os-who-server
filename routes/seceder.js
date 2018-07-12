/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const moment = require('moment')
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

router.get('/seceders', auth.needsUserLogin, async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000;
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0;
	const where = {}
	if (_.has(req.query, 'signupFrom') && _.has(req.query, 'signupTo')) {
		where.createdAt = {$gte: moment(req.query.signupFrom).toDate(), $lte: moment(req.query.signupTo).toDate()}
	}

	if (_.has(req.query, 'birthYearFrom') && _.has(req.query, 'birthYearTo')) {
		where.birthYear = {$gte: req.query.birthYearFrom, $lte: req.query.birthYearTo}
	}

	if (_.has(req.query, 'sex')) {
		where.sex = req.query.sex;
	}

	if (_.has(req.query, 'status')) {
		// where.sex = req.query.sex;
	}

	if (_.has(req.query, 'name')) {
		userWhere.name = req.query.name
	}
	if (_.has(req.query, 'phone')) {
		userWhere.phone = req.query.phone.replace(/-/g, '')
	}
	if (_.has(req.query, 'email')) {
		userWhere.email = req.query.email
	}	

	const seceders = await Seceder.findAll({
		where,
		order: [['id', 'desc']],
		limit,
		offset,
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
