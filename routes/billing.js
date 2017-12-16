/* eslint new-cap: 0, unicorn/explicit-length-check: 0 */

const _ = require('lodash')
const express = require('express')
const billingConfig = require('config').billing
const moment = require('moment')
const auth = require('../middlewares/auth')
const BillingHistory = require('../models').BillingHistory
const User = require('../models').User

const router = express.Router()

router.get('/billingHistories', auth.needsAdmin, async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0
	const where = {}
	const userWhere = {}

	if (_.has(req.query, 'product')) {
		switch (req.query.product) {
			case '33매':
				where.productId = billingConfig.stamp33
				break
			case '105매':
				where.productId = billingConfig.stamp100
				break
			case '220매':
				where.productId = billingConfig.stamp200
				break
			case '600매':
				where.productId = billingConfig.stamp500
				break
			case '1300매':
				where.productId = billingConfig.stamp1000
				break
			case '구독권 30일권':
				where.productId = billingConfig.subscription30
				break
			case '구독권 60일권':
				where.productId = billingConfig.subscription60
				break
			case '구독권 90일권':
				where.productId = billingConfig.subscription90
				break
			case '구독권 180일권':
				where.productId = billingConfig.subscription180
				break
			default:
				break
		}
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
	if (_.has(req.query, 'from') && _.has(req.query, 'to')) {
		where.createdAt = {$gte: moment(req.query.from).toDate(), $lte: moment(req.query.to).toDate()}
	}

	let billingHistories

	if (req.query.refunded) {
		where.refunded = true
		billingHistories = await BillingHistory.findAll({
			where,
			order: [['refundedAt', 'desc']],
			limit,
			offset,
			include: [
				{model: User, as: 'user', where: userWhere, include: [// 여기다가 이름 이메일 웨얼 거셈
					{model: BillingHistory, as: 'billingHistories'}
				]}
			]
		})
		if (req.query.length) {
			billingHistories = await BillingHistory.findAll({where})
			return res.json({length: billingHistories.length})
		}
	} else {
		billingHistories = await BillingHistory.findAll({
			where,
			order: [['id', 'desc']],
			limit,
			offset,
			include: [
				{model: User, as: 'user', where: userWhere, include: [
					{model: BillingHistory, as: 'billingHistories'}
				]}
			]
		})
	}

	if (req.query.length) {
		billingHistories = await BillingHistory.findAll({where})
		return res.json({length: billingHistories.length})
	}

	return res.json(billingHistories.map(o => {
		const toRes = o.toRes()
		toRes.user = _.omit(toRes.user, 'billingHistories')
		toRes.billingCount = o.user.billingHistories.length
		return toRes
	}))
})

// {refunded, memo, refundMemo}
router.put('/billingHistories/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const billingHistory = await BillingHistory.findOne({where: {id}})

	if (req.body.refunded) {
		req.body.refundedAt = new Date()
	}

	await billingHistory.update(_.pick(req.body, ['refunded', 'refundedAt', 'memo', 'refundMemo']))

	return res.json(billingHistory.toRes())
})

router.delete('/billingHistories/:id', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const billingHistory = await BillingHistory.findOne({where: {id}})

	if (!billingHistory) {
		return res.status(404).send('Not found billing history')
	}

	await billingHistory.destroy()

	return res.send('deleted')
})

module.exports = router
