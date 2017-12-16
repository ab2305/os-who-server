/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const File = require('../models').File
// Const fcm = require('../lib/fcm')
const Invitee = require('../models').Invitee
const Question = require('../models').Question
const User = require('../models').User

const router = express.Router()

router.post('/question', auth.needsLogin, async (req, res, next) => {
	let question

	if (req.user.email) {
		req.body.userId = req.user.id
		req.body.inviteeId = null
	}
	if (req.user.code) {
		req.body.userId = null
		req.body.inviteeId = req.user.id
	}

	try {
		question = await Question.create(_.pick(req.body, ['body', 'userId', 'inviteeId', 'fileId']))
	} catch (err) {
		return next(err)
	}

	return res.json(question.toRes())
})

router.get('/questions', auth.needsLogin, async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0
	let questions

	if (req.user.email) {
		if (req.user.admin) {
			questions = await Question.findAll({
				order: [['id', 'desc']],
				include: [
					{model: File, as: 'file'},
					{model: User, as: 'user'},
					{model: Invitee, as: 'invitee'}
				],
				limit,
				offset
			})
		} else {
			questions = await Question.findAll({
				order: [['id', 'desc']],
				include: [
					{model: File, as: 'file'},
					{model: User, as: 'user'},
					{model: Invitee, as: 'invitee'}
				],
				where: {userId: req.user.id},
				limit,
				offset
			})
		}
	}
	if (req.user.code) {
		questions = await Question.findAll({
			order: [['id', 'desc']],
			include: [
				{model: File, as: 'file'},
				{model: User, as: 'user'},
				{model: Invitee, as: 'invitee'}
			],
			where: {inviteeId: req.user.id},
			limit,
			offset
		})
	}

	return res.json(questions.map(o => o.toRes()))
})

router.get('/questions/:id', auth.needsLogin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const question = await Question.findOne({
		where: {id},
		include: [
			{model: File, as: 'file'},
			{model: User, as: 'user'},
			{model: Invitee, as: 'invitee'}
		]
	})

	if (!question) {
		return res.status(404).send('Not found notice')
	}

	return res.json(question.toRes())
})

router.post('/questions/:id/comment', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const question = await Question.findOne({
		where: {id},
		include: [
			{model: File, as: 'file'},
			{model: User, as: 'user'},
			{model: Invitee, as: 'invitee'}
		]
	})

	question.update(_.pick(req.body, ['comment']))

	// Await fcm.send(`user_${question.userId}`, {
	// 	notification: {
	// 		title: '1대1 문의에 대한 답변이 달렸습니다.',
	// 		body: '1대1 문의에 대한 답변이 달렸습니다. 확인해보세요.'
	// 	},
	// 	data: {
	// 		category: 'note'
	// 	}
	// })

	return res.json(question.toRes())
})

module.exports = router
