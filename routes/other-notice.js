/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
// Const fcm = require('../lib/fcm')
const OtherNotice = require('../models').OtherNotice

const router = express.Router()

router.post('/other-notice', auth.needsAdmin, async (req, res) => {
	if (!req.body.category) {
		return res.status(400).send('No category in body')
	}
	const notice = await OtherNotice.create(_.pick(req.body, ['title', 'body', 'isTop', 'category']))

	// Await fcm.send('notice', {
	// 	notification: {
	// 		title: '새로운 글이 등록되었습니다.',
	// 		body: '관리자의 새로운 메세지가 도착했습니다.'
	// 	},
	// 	data: {
	// 		category: 'note'
	// 	}
	// })

	return res.json(notice.toJSON())
})

router.put('/other-notices/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const notice = await OtherNotice.findOne({where: {id}})

	if (!notice) {
		return res.status(404).send('Not found notice')
	}

	await notice.update(_.pick(req.body, ['title', 'body', 'isTop', 'category']))

	return res.json(notice.toJSON())
})

router.delete('/other-notices/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const notice = await OtherNotice.findOne({where: {id}})

	if (!notice) {
		return res.status(404).send('Not found notice')
	}

	await notice.destroy()

	return res.json(notice.toJSON())
})

router.get('/other-notices', async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0
	if (!req.query.category) {
		return res.status(400).send('No category request query')
	}
	if (!_.includes(['term', 'privacy'], req.query.category)) {
		return res.status(400).send('Invalid category')
	}

	let where = {isTop: false}
	if (req.query.top) {
		where = {isTop: true}
	}
	where.category = req.query.category

	const notices = await OtherNotice.findAll({
		order: [['id', 'desc']],
		where,
		limit,
		offset
	})

	return res.json(notices.map(o => o.toJSON()))
})

router.get('/other-notices/:id', async (req, res) => {
	const id = parseInt(req.params.id, 10)
	if (!req.query.category) {
		return res.status(400).send('No category request query')
	}
	if (!_.includes(['term', 'privacy'], req.query.category)) {
		return res.status(400).send('Invalid category')
	}
	const where = {id}
	where.category = req.query.category

	const notice = await OtherNotice.findOne({where})

	if (!notice) {
		return res.status(404).send('Not found other-notice')
	}

	const viewCount = notice.viewCount + 1
	await notice.update({viewCount})

	return res.json(notice.toJSON())
})

module.exports = router
