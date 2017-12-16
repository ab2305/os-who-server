/* eslint new-cap: 0, unicorn/explicit-length-check: 0 */

const _ = require('lodash')
const express = require('express')
const moment = require('moment')
const auth = require('../middlewares/auth')
const BillingHistory = require('../models').BillingHistory
const User = require('../models').User
const Invitee = require('../models').Invitee
const Seceder = require('../models').Seceder
const getDays = require('../lib/get-days')

const router = express.Router()

router.get('/stats/daily', auth.needsAdmin, async (req, res) => {
	const count = parseInt(req.query.count, 10)
	const year = parseInt(req.query.year, 10)
	const month = parseInt(req.query.month, 10)

	const days = getDays.day(count, year, month)

	const oldestDay = moment(_.last(days).date).subtract(1, 'days').toDate()
	const newestDay = moment(_.head(days).date).add(1, 'days').toDate()

	let billingHistories = await BillingHistory.findAll({
		where: {createdAt: {$gte: oldestDay, $lte: newestDay}},
		order: [['id', 'desc']]
	})

	if (req.query.length) {
		billingHistories = await BillingHistory.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}})
		return res.json({length: billingHistories.length})
	}

	const users = await User.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const invitees = await Invitee.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const loginedInvitees = await Invitee.findAll({where: {logined: false, createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const seceders = await Seceder.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const billingHistoriesJSON = billingHistories.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value())

	const allStamp = _.countBy(_.filter(billingHistoriesJSON, o => {
		return o.category === 'stamp'
	}), 'createdAt')

	const allSubscription = _.countBy(_.filter(billingHistoriesJSON, o => {
		return o.category === 'subscription'
	}), 'createdAt')

	const allUsers = _.countBy(users.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const allInvitees = _.countBy(invitees.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const allLoginedInvitees = _.countBy(loginedInvitees.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const allSeceders = _.countBy(seceders.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const stats = days.map(s => {
		const stampSales = _.sum(_.map(billingHistoriesJSON, o => {
			if (o.category === 'stamp' && o.createdAt.toString() === s.date.toString()) {
				return parseInt(o.price, 10)
			}
			return 0
		}))

		const subscriptionSales = _.sum(_.map(billingHistoriesJSON, o => {
			if (o.category === 'subscription' && o.createdAt.toString() === s.date.toString()) {
				return parseInt(o.price, 10)
			}
			return 0
		}))

		const stampCount = allStamp[s.date] || 0
		const subscriptionCount = allSubscription[s.date] || 0
		const usersCount = allUsers[s.date] || 0
		const secedersCount = allSeceders[s.date] || 0
		const inviteesCount = allInvitees[s.date] || 0
		const lgoinInviteesCount = allLoginedInvitees[s.date] || 0

		return _.chain(s)
			.extend({
				stampCount,
				stampSales,
				subscriptionCount,
				subscriptionSales,
				allBillingCount: stampCount + subscriptionCount,
				allSales: stampSales + subscriptionSales,
				usersCount,
				secedersCount,
				inviteesCount,
				lgoinInviteesCount
			})
			.value()
	})

	return res.json(stats)
})

router.get('/stats/monthly', auth.needsAdmin, async (req, res) => {
	const count = parseInt(req.query.count, 10) || 2
	const year = parseInt(req.query.year, 10)
	const month = parseInt(req.query.month, 10)

	const months = getDays.month(count, year, month)

	const oldestDay = moment(_.last(months).date).subtract(1, 'days').toDate()
	const newestDay = moment(_.head(months).date).add(1, 'days').toDate()

	let billingHistories = await BillingHistory.findAll({
		where: {createdAt: {$gte: oldestDay, $lte: newestDay}},
		order: [['id', 'desc']]
	})

	if (req.query.length) {
		billingHistories = await BillingHistory.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}})
		return res.json({length: billingHistories.length})
	}

	const users = await User.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const invitees = await Invitee.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const loginedInvitees = await Invitee.findAll({where: {logined: false, createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const seceders = await Seceder.findAll({where: {createdAt: {$gte: oldestDay, $lte: newestDay}}, order: [['id', 'desc']]})

	const billingHistoriesJSON = billingHistories.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).endOf('month').set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value())

	const allStamp = _.countBy(_.filter(billingHistoriesJSON, o => {
		return o.category === 'stamp'
	}), 'createdAt')

	const allSubscription = _.countBy(_.filter(billingHistoriesJSON, o => {
		return o.category === 'subscription'
	}), 'createdAt')

	const allUsers = _.countBy(users.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).endOf('month').set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const allInvitees = _.countBy(invitees.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).endOf('month').set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const allLoginedInvitees = _.countBy(loginedInvitees.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).endOf('month').set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const allSeceders = _.countBy(seceders.map(o => _.chain(o.toJSON())
		.extend({
			createdAt: moment(o.createdAt).endOf('month').set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
		.value()), 'createdAt')

	const stats = months.map(s => {
		const stampSales = _.sum(_.map(billingHistoriesJSON, o => {
			if (o.category === 'stamp' && o.createdAt.toString() === s.date.toString()) {
				return parseInt(o.price, 10)
			}
			return 0
		}))

		const subscriptionSales = _.sum(_.map(billingHistoriesJSON, o => {
			if (o.category === 'subscription' && o.createdAt.toString() === s.date.toString()) {
				return parseInt(o.price, 10)
			}
			return 0
		}))

		const stampCount = allStamp[s.date] || 0
		const subscriptionCount = allSubscription[s.date] || 0
		const usersCount = allUsers[s.date] || 0
		const secedersCount = allSeceders[s.date] || 0
		const inviteesCount = allInvitees[s.date] || 0
		const lgoinInviteesCount = allLoginedInvitees[s.date] || 0

		return _.chain(s)
			.extend({
				stampCount,
				stampSales,
				subscriptionCount,
				subscriptionSales,
				allBillingCount: stampCount + subscriptionCount,
				allSales: stampSales + subscriptionSales,
				usersCount,
				secedersCount,
				inviteesCount,
				lgoinInviteesCount
			})
			.value()
	})

	return res.json(stats)
})

router.get('/stats/users', auth.needsAdmin, async (req, res) => {
	const count = parseInt(req.query.count, 10) || 2
	const year = parseInt(req.query.year, 10)
	const month = parseInt(req.query.month, 10)

	const months = getDays.month(count, year, month)

	const oldestDay = moment(_.last(months).date).subtract(1, 'days').toDate()
	const newestDay = moment(_.head(months).date).add(1, 'days').toDate()

	const where = {}
	let billingWhere = {createdAt: {$gte: oldestDay, $lte: newestDay}}

	if (req.query.name) {
		where.name = req.query.name
		billingWhere = {}
	}

	if (req.query.email) {
		where.email = req.query.email
		billingWhere = {}
	}

	const users = await User.findAll({
		where,
		include: [
			{model: BillingHistory, as: 'billingHistories', require: true, where: billingWhere}
		]
	})

	const stats = users.map(user => {
		const json = _.pick(user.toJSON(), ['id', 'name', 'email', 'phone'])
		json.stampSales = _.sum(user.billingHistories.map(billingHistory => {
			if (billingHistory.category === 'stamp') {
				return parseInt(billingHistory.price, 10)
			}
			return 0
		}))
		json.stampCount = user.billingHistories.filter(billingHistory => {
			return billingHistory.category === 'stamp'
		}).length
		json.subscriptionSales = _.sum(user.billingHistories.map(billingHistory => {
			if (billingHistory.category === 'subscription') {
				return parseInt(billingHistory.price, 10)
			}
			return 0
		}))
		json.refundCount = user.billingHistories.filter(billingHistory => {
			return billingHistory.refunded === true
		}).length
		json.refundSales = _.sum(user.billingHistories.map(billingHistory => {
			if (billingHistory.refunded === true) {
				return parseInt(billingHistory.price, 10)
			}
			return 0
		}))
		json.subscriptionCount = user.billingHistories.filter(billingHistory => {
			return billingHistory.category === 'subscription'
		}).length
		json.allBillingCount = json.stampCount + json.subscriptionCount
		json.allSales = json.stampSales + json.subscriptionSales
		return json
	})

	return res.send(_.orderBy(stats, ['allSales'], ['desc']))
})

module.exports = router
