/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
// Const fcm = require('../lib/fcm')
const Note = require('../models').Note
const User = require('../models').User

const router = express.Router()

router.post('/note', auth.needsAdmin, async (req, res) => {
	if (!req.body.userId) {
		return res.status(400).send('no userId in request body')
	}

	let note = await Note.create(_.pick(req.body, ['title', 'body', 'userId', 'isTop']))

	note = await Note.findOne({
		where: {id: note.id},
		include: [
			{model: User, as: 'user'}
		]
	})

	// Await fcm.send(`user_${req.body.userId}`, {
	// 	notification: {
	// 		title: '새로운 글이 등록되었습니다.',
	// 		body: '관리자의 새로운 메세지가 도착했습니다.'
	// 	},
	// 	data: {
	// 		category: 'note'
	// 	}
	// })

	return res.json(note.toRes())
})

router.get('/notes', auth.needsUserLogin, async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0

	let notes

	let where = {isTop: false}
	if (req.query.top) {
		where = {isTop: true}
	}

	if (req.user.email) {
		if (req.user.admin) {
			notes = await Note.findAll({
				where,
				order: [['id', 'desc']],
				include: [
					{model: User, as: 'user'}
				],
				limit,
				offset
			})
		} else {
			notes = await Note.findAll({
				order: [['id', 'desc']],
				include: [
					{model: User, as: 'user'}
				],
				where: {userId: req.user.id},
				limit,
				offset
			})
		}
	}

	return res.json(notes.map(o => o.toRes()))
})

router.get('/notes/:id', auth.needsUserLogin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const note = await Note.findOne({
		where: {id},
		include: [
			{model: User, as: 'user'}
		]
	})

	if (!req.user.admin && note.userId === req.user.id) {
		await note.update({isRead: true})
	}

	if (!note) {
		return res.status(404).send('Not found note')
	}

	return res.json(note.toRes())
})

router.delete('/notes/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const note = await Note.findOne({where: {id}})

	if (!note) {
		return res.status(404).send('Not found note')
	}

	await note.destroy()

	return res.json(note.toJSON())
})

module.exports = router
