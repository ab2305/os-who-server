/* eslint new-cap: 0 */

const _ = require('lodash')
const billingConfig = require('config').billing
const express = require('express')
const moment = require('moment')
const auth = require('../middlewares/auth')
const BillingHistory = require('../models').BillingHistory
const connection = require('../models').connection
const Item = require('../models').Item
const logger = require('../lib/logger')

const router = express.Router()
router.post('/me/item', auth.needsUserLogin, async (req, res, next) => {
	let myItem = await Item.findOne({where: {userId: req.user.id}})
  console.log('new requesdfsf \n\n\n\n')
  console.log(req.body);

	if (!myItem) {
		myItem = await Item.init(req.user.id)
	}

	let stamp
	let subscriptionEndedAt = myItem.subscriptionEndedAt
	let subscriptionStartedAt = myItem.subscriptionEndedAt
	const updateList = {}

	let tip
	let price
	switch (req.body.productId) {
		case billingConfig.stamp33:
			tip = 0
			stamp = myItem.stamp + parseInt(33 * (1 + tip), 10)
			price = 1000
			updateList.stamp = stamp
			updateList.category = 'stamp'
			break
		case billingConfig.stamp100:
			tip = 0.05
			stamp = myItem.stamp + parseInt(100 * (1 + tip), 10)
			price = 3000
			updateList.stamp = stamp
			updateList.category = 'stamp'
			break
		case billingConfig.stamp200:
			tip = 0.1
			stamp = myItem.stamp + parseInt(200 * (1 + tip), 10)
			price = 6000
			updateList.stamp = stamp
			updateList.category = 'stamp'
			break
		case billingConfig.stamp500:
			tip = 0.2
			stamp = myItem.stamp + parseInt(500 * (1 + tip), 10)
			price = 15000
			updateList.stamp = stamp
			updateList.category = 'stamp'
			break
		case billingConfig.stamp1000:
			tip = 0.3
			stamp = myItem.stamp + parseInt(1000 * (1 + tip), 10)
			price = 30000
			updateList.stamp = stamp
			updateList.category = 'stamp'
			break
		case billingConfig.subscription30:
			if (_.isNull(subscriptionEndedAt)) {
				subscriptionStartedAt = moment().format()
				subscriptionEndedAt = moment().format()
			}
			subscriptionEndedAt = moment(subscriptionEndedAt).add(30, 'days').format()
			price = 9000
			updateList.subscriptionEndedAt = subscriptionEndedAt
			updateList.subscriptionStartedAt = subscriptionStartedAt
			updateList.category = 'subscription'
			break
		case billingConfig.subscription60:
			if (_.isNull(subscriptionEndedAt)) {
				subscriptionStartedAt = moment().format()
				subscriptionEndedAt = moment().format()
			}
			subscriptionEndedAt = moment(subscriptionEndedAt).add(60, 'days').format()
			price = 16000
			updateList.subscriptionEndedAt = subscriptionEndedAt
			updateList.subscriptionStartedAt = subscriptionStartedAt
			updateList.category = 'subscription'
			break
		case billingConfig.subscription90:
			if (_.isNull(subscriptionEndedAt)) {
				subscriptionStartedAt = moment().format()
				subscriptionEndedAt = moment().format()
			}
			subscriptionEndedAt = moment(subscriptionEndedAt).add(90, 'days').format()
			price = 22000
			updateList.subscriptionEndedAt = subscriptionEndedAt
			updateList.subscriptionStartedAt = subscriptionStartedAt
			updateList.category = 'subscription'
			break
		case billingConfig.subscription180:
			if (_.isNull(subscriptionEndedAt)) {
				subscriptionStartedAt = moment().format()
				subscriptionEndedAt = moment().format()
			}
			subscriptionEndedAt = moment(subscriptionEndedAt).add(180, 'days').format()
			price = 39000
			updateList.subscriptionEndedAt = subscriptionEndedAt
			updateList.subscriptionStartedAt = subscriptionStartedAt
			updateList.category = 'subscription'
			break
		default:
			return res.status(400).send('invalid productId')
	}

	const t = await connection.transaction()
	req.body.userId = req.user.id
	req.body.price = price
	req.body.category = updateList.category

	// Transaction starting
	try {
		const pickList = [
			'productId', 'orderId', 'purchaseToken',
			'purchaseTime', 'purchaseState', 'receiptSignature',
			'receiptData', 'developerPayload', 'userId',
			'price', 'category'
		]

		await myItem.update(updateList, {transaction: t})
		await BillingHistory.create(_.pick(req.body, pickList), {transaction: t})
		await t.commit()
	} catch (err) {
		await t.rollback()
		logger.error(err)
		return next(err)
	}
	// Transaction ending

	return res.status(200).end()
})

router.put('/users/:id/item', auth.needsAdmin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const userItem = await Item.findOne({where: {userId: id}})

	if (!userItem) {
		return res.status(404).send('Not found user')
	}

	if (req.body.stamp) {
		req.body.itemHistories = userItem.itemHistories
		req.body.itemHistories.stamp.unshift({date: new Date(), type: req.body.type, value: req.body.stamp})

		if (req.body.type === 'add') {
			req.body.stamp = userItem.stamp + parseInt(req.body.stamp, 10)
		}
		if (req.body.type === 'subtract') {
			req.body.stamp = userItem.stamp - parseInt(req.body.stamp, 10)
		}
		await userItem.update(_.pick(req.body, ['stamp', 'itemHistories']))
	} else {
		req.body.itemHistories = userItem.itemHistories
		req.body.itemHistories.subscription.unshift({
			date: new Date(), type: req.body.type,
			fromStartedAt: userItem.subscriptionStartedAt,
			fromEndedAt: userItem.subscriptionEndedAt,
			toStartedAt: req.body.subscriptionStartedAt,
			toEndedAt: req.body.subscriptionEndedAt
		})
		await userItem.update(_.pick(req.body, ['subscriptionStartedAt', 'subscriptionEndedAt', 'itemHistories']))
	}

	return res.json(userItem.toRes())
})

module.exports = router
