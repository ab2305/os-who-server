/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const Faq = require('../models').Faq
// Const fcm = require('../lib/fcm')

const router = express.Router()

router.post('/faq', auth.needsAdmin, async (req, res) => {
	const faq = await Faq.create(_.pick(req.body, ['title', 'body']))

	// Await fcm.send('notice', {
	// 	notification: {
	// 		title: '새로운 글이 등록되었습니다.',
	// 		body: '관리자의 새로운 메세지가 도착했습니다.'
	// 	},
	// 	data: {
	// 		category: 'note'
	// 	}
	// })

	return res.json(faq.toRes())
})

router.put('/faqs/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const faq = await Faq.findOne({where: {id}})

	if (!faq) {
		return res.status(404).send('Not found faq')
	}

	await faq.update(_.pick(req.body, ['title', 'body', 'isTop']))

	return res.json(faq.toRes())
})

router.delete('/faqs/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)
	const faq = await Faq.findOne({where: {id}})

	if (!faq) {
		return res.status(404).send('Not found faq')
	}

	await faq.destroy()

	return res.json(faq.toRes())
})

router.get('/faqs', async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0

	const faqs = await Faq.findAll({
		order: [['id', 'desc']],
		limit,
		offset
	})

	return res.json(faqs.map(o => o.toRes()))
})

router.get('/faqs/:id', async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const faq = await Faq.findOne({where: {id}})

	if (!faq) {
		return res.status(404).send('Not found faq')
	}

	return res.json(faq.toRes())
})

module.exports = router
