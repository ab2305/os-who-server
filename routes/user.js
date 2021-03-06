/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const moment = require('moment')
const randomstring = require('randomstring')
const auth = require('../middlewares/auth')
const coolsms = require('../lib/coolsms')
const mail = require('../lib/mail')
const User = require('../models').User
const Message = require('../models').Message
const Chat = require('../models').Chat
const UserInvitee = require('../models').UserInvitee
const Item = require('../models').Item
const BillingHistory = require('../models').BillingHistory
const UsingHistory = require('../models').UsingHistory
const Invitee = require('../models').Invitee
const UserInformation = require('../models').UserInformation

const router = express.Router()

router.post('/user/emailfinding', async (req, res, next) => {
	if (!_.has(req.body, 'phone')) {
		return res.status(400).send('No phone in request body')
	}
	const user = await User.findOne({where: {phone: req.body.phone.replace(/-/g, '')}})

	if (!user) {
		return res.status(404).send('Not found user')
	}

	if (req.cookies.findme && req.cookies.findme.count < 2) {
		res.cookie('findme', {user: 1, count: 2}, {maxAge: 86000000})
		try {
			await coolsms.send(user.phone, `회원님의 누굴까 아이디는 ${user.email} 입니다.`)
		} catch (err) {
			return next(err)
		}
	}
	if (!req.cookies.findme) {
		res.cookie('findme', {user: 1, count: 1}, {maxAge: 86500000})
		try {
			await coolsms.send(user.phone, `회원님의 누굴까 아이디는 ${user.email} 입니다.`)
		} catch (err) {
			return next(err)
		}
	}

	return res.status(200).end()
})

router.post('/user/tpassword', async (req, res, next) => {
	if (!_.has(req.body, 'email')) {
		return res.status(400).send('No email in request body')
	}
	const user = await User.findOne({where: {email: req.body.email}})

	if (!user) {
		return res.status(404).send('Not found user')
	}

	const temporaryPassword = randomstring.generate({length: 6, charset: 'numeric'})
	try {
		await mail.send(user.email, `누굴까 임시비밀번호 발급 안내`, `회원님의 누굴까 임시비밀번호는 ${temporaryPassword} 입니다.`)
	} catch (err) {
		return next(err)
	}
	await user.setPassword(temporaryPassword)

	return res.status(200).end()
})

router.put('/me/password', auth.needsUserLogin, async (req, res) => {
	if (!_.isString(req.body.password) || req.body.password.length < 4) {
		return res.status(400).end('Wrong password format')
	}
	const user = await User.findOne({
		where: {
			id: req.user.id
		}
	})

	await user.setPassword(req.body.password)

	return res.status(200).end()
})

router.get('/users', auth.needsUserLogin, async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000;
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0;
	const where = {}
	if (_.has(req.query, 'signupFrom') && _.has(req.query, 'signupTo')) {
		where.createdAt = {$gte: moment(req.query.signupFrom).toDate(), $lte: moment(req.query.signupTo).toDate()};
	}

	if (_.has(req.query, 'birthYearFrom') && _.has(req.query, 'birthYearTo')) {
		where.birthYear = {$gte: req.query.birthYearFrom, $lte: req.query.birthYearTo};
	}

	if (_.has(req.query, 'sex')) {
		where.sex = req.query.sex;
	}

	if (_.has(req.query, 'status')) {
		// where.sex = req.query.sex;
	}

	if (_.has(req.query, 'name')) {
		where.name = req.query.name
	}
	if (_.has(req.query, 'phone')) {
		where.phone = req.query.phone.replace(/-/g, '')
	}
	if (_.has(req.query, 'email')) {
		where.email = req.query.email
	}

	let users;
	if (req.query.name) {
		where.name = {$iLike: `%${req.query.name}%`}
	}
	if (req.query.email) {
		where.email = {$iLike: `%${req.query.email}%`}
	}
	users = await User.findAll({
		where,
		order: [['id', 'desc']],
		limit,
		offset,		
		include: [
			{model: Item, as: 'item'},
			{model: BillingHistory, as: 'billingHistories'},
			{model: UserInvitee, as: 'userInvitees'},
			{model: UserInformation, as: 'userInformation'}
			
		]
	})

	if (req.query.length) {
		users = await User.findAll({where})
		return res.json({length: users.length})
	}

	return res.json(users.map(o => o.toRes()))
})

router.get('/users/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const user = await User.findOne({
		where: {id},
		include: [
			{model: Item, as: 'item'},
			{model: BillingHistory, as: 'billingHistories'},
			{model: UserInvitee, as: 'userInvitees', include: [
				{model: Invitee, as: 'invitee'}
			]},
			{model: UsingHistory, as: 'usingHistories'},
			{model: UserInformation, as: 'userInformation'}
		]
	})

	return res.json(user.toRes())
})

router.put('/users/:id/status', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	if (!req.body.status) {
		return res.status(400).send('no status')
	}

	let userInformation = await UserInformation.findOne({where: {userId: id}})
	if (!userInformation) {
		userInformation = await UserInformation.create({userId: id})
	}

	await userInformation.update({status: req.body.status})

	return res.json({status: req.body.status})
})

router.put('/users/:id/memo', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	if (!req.body.memo) {
		return res.status(400).send('no status')
	}

	let userInformation = await UserInformation.findOne({where: {userId: id}})
	if (!userInformation) {
		userInformation = await UserInformation.create({userId: id})
	}

	await userInformation.update({memo: req.body.memo})

	return res.json({memo: req.body.memo})
})

module.exports = router
