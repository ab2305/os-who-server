/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
// Const fcm = require('../lib/fcm')
const Notice = require('../models').Notice

const router = express.Router()

router.post('/notice', auth.needsAdmin, async (req, res) => {
	const notice = await Notice.create(_.pick(req.body, ['title', 'body', 'isTop']))

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

router.put('/notices/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const notice = await Notice.findOne({where: {id}})

	if (!notice) {
		return res.status(404).send('Not found notice')
	}

	await notice.update(_.pick(req.body, ['title', 'body', 'isTop']))

	return res.json(notice.toJSON())
})

router.delete('/notices/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const notice = await Notice.findOne({where: {id}})

	if (!notice) {
		return res.status(404).send('Not found notice')
	}

	await notice.destroy()

	return res.json(notice.toJSON())
})

router.get('/notices', async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0

	let where = {isTop: false}
	if (req.query.top) {
		where = {isTop: true}
	}

	const notices = await Notice.findAll({
		order: [['id', 'desc']],
		where,
		limit,
		offset
	})

	return res.json(notices.map(o => o.toJSON()))
})

router.get('/notices/:id', async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const notice = await Notice.findOne({where: {id}})

	if (!notice) {
		return res.status(404).send('Not found notice')
	}

	const viewCount = notice.viewCount + 1
	await notice.update({viewCount})

	return res.json(notice.toJSON())
})

module.exports = router
