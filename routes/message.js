/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const moment = require('moment')
const auth = require('../middlewares/auth')
const Chat = require('../models').Chat
const connection = require('../models').connection
const Device = require('../models').Device
const File = require('../models').File
const fcm = require('../lib/fcm')
const Message = require('../models').Message
const Item = require('../models').Item
const Invitee = require('../models').Invitee
const User = require('../models').User
const UserInvitee = require('../models').UserInvitee
const UsingHistory = require('../models').UsingHistory
const logger = require('../lib/logger')

const router = express.Router()

router.post('/user/message', auth.needsUserLogin, async (req, res, next) => {
	const chat = await Chat.findOne({
		where: {topic: req.body.topic, userId: req.user.id},
		include: [
			{model: Message, as: 'messages'},
			{model: Invitee, as: 'invitee', include: [
				{model: User, as: 'friends'},
				{model: Device, as: 'device'}
			]}
		]
	})

	if (!chat) {
		return res.status(404).send('not found chat with topic')
	}

	req.body.userId = req.user.id
	req.body.chatId = chat.id
	const myItem = await Item.findOne({where: {userId: req.user.id}})

	if (myItem.stamp === 0) {
		return res.status(400).send('no stamp')
	}

	let stamp = myItem.stamp - 1

	if (_.isEmpty(chat.messages) || myItem.subscribed) {
		stamp = myItem.stamp
	}
	const userInviteeId = _.find(chat.get('invitee').get('friends'), {id: req.user.id}).UserInvitee.id

	let usingHistory = await UsingHistory.findOne({
		where: {
			userId: req.user.id,
			userInviteeId,
			createdAt: {
				$lte: moment().set({hour: 0, minute: 0, second: 0, millisecond: 0}).add(1, 'days').toDate(),
				$gte: moment().set({hour: 0, minute: 0, second: 0, millisecond: 0}).toDate()
			}
		},
		include: [
			{model: UserInvitee, as: 'userInvitee', include: [
				{model: Invitee, as: 'invitee'}
			]}
		]
	})

	const t = await connection.transaction()
	let message

	try {
		if (usingHistory) {
			await usingHistory.update({usedStamp: usingHistory.usedStamp + 1}, {transaction: t})
		} else {
			usingHistory = await UsingHistory.create({usedStamp: 1, userId: req.user.id, userInviteeId}, {transaction: t})
		}

		await myItem.update({stamp}, {transaction: t})
		message = await Message.create(_.pick(req.body, ['text', 'userId', 'chatId', 'fileId']), {transaction: t})
		await t.commit()
	} catch (err) {
		await t.rollback()
		logger.error(err)
		return next(err)
	}
	let file
	if (req.body.fileId) {
		file = await File.findOne({where: {id: req.body.fileId}})
	}

	let sound = 'default'
	let useSound = true
	if (_.hasIn(chat.get('invitee'), 'device.useSound')) {
		useSound = chat.get('invitee').device.useSound
	}
	if (useSound === false) {
		sound = null
	}

	try {
		fcm.send(chat.topic, {
			notification: {
				title: message.text,
				body: req.user.nickname,
				sound
			},
			data: {
				id: message.id,
				category: 'message',
				categoryId: chat.id,
				userId: req.user.id,
				userType: 'email',
				fileUrl: (file) ? file.url() : null
			}
		})
	} catch (err) {
		logger.error(err)
		return next(err)
	}

	return res.json(_.chain(message.toJSON()).extend({
		file: (file) ? file.toRes() : null,
		stamp
	}).value())
})

router.get('/user/chats', auth.needsUserLogin, async (req, res) => {
	let chats = await Chat.findAll({
		order: [
			[{model: Message, as: 'messages'}, 'id', 'DESC']
		],
		where: {userId: req.user.id},
		include: [
			{model: Message, as: 'messages'},
			{model: Invitee, as: 'invitee', include: [
				{model: User, as: 'friends'}
			]}
		]
	})

	chats = chats.map(chat => {
		return _.chain(chat.toJSON())
		.omit('invitee')
		.extend({
			messages: chat.get('messages')[0],
			unreadMessageLength: _.filter(chat.get('messages'), message => {
				return message.userId === null && message.isRead === false
			}).length,
			hasInviteeMessage: chat.get('messages').some(o => !_.isNull(o.inviteeId)),
			chatUserName: _.find(chat.get('invitee').get('friends'), {id: req.user.id}).UserInvitee.name,
			inviteeId: _.find(chat.get('invitee').get('friends'), {id: req.user.id}).UserInvitee.inviteeId,
			inviteePhone: chat.get('invitee').phone
		})
		.value()
	})

	return res.json(chats)
})

router.put('/invitees/:id/name', auth.needsUserLogin, async (req, res) => {
	const inviteeId = parseInt(req.params.id, 10)
	const userInvitee = await UserInvitee.findOne({
		where: {userId: req.user.id, inviteeId}
	})

	if (!userInvitee) {
		return res.status(404).send('Not found invitee')
	}

	await userInvitee.update({name: req.body.name})

	return res.status(200).end()
})

router.post('/block',  auth.needsUserLogin, async (req, res, next) => {
	const chat = await Chat.findOne({
		where: {topic: req.body.topic, userId: req.user.id},
		include: [
			{model: Message, as: 'messages'},
			{model: Invitee, as: 'invitee', include: [
				{model: User, as: 'friends'},
				{model: Device, as: 'device'}
			]}
		]
	})

	if (!chat) {
		return res.status(404).send('not found chat with topic')
	}
	return res.status(200).end()
})


router.get('/user/usinghistories/:id', auth.needsUserLogin, async (req, res) => {
	const userId = parseInt(req.params.id, 10)
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0
	if (offset < 0) {
		return res.status(400).send('offset is not natural number')
	}
	const usingHistories = await UsingHistory.findAll({
		offset,
		limit,
		order: [['id', 'desc']],
		include: [
			{model: UserInvitee, as: 'userInvitee'}
		],
		where: {userId}
	})

	return res.json(usingHistories.map(usingHistory => {
		return _.chain(usingHistory.toJSON())
		.pick(['id', 'usedStamp', 'createdAt'])
		.extend({
			invitee: usingHistory.get('userInvitee').name
		})
		.value()
	}))
})

router.post('/invitee/message', auth.needsInviteeLogin, async (req, res, next) => {
	const chat = await Chat.findOne({
		where: {topic: req.body.topic, inviteeId: req.user.id},
		include: [
			{model: Message, as: 'messages'},
			{model: Invitee, as: 'invitee', include: [
				{model: User, as: 'friends', include: [
					{model: Device, as: 'device'}
				]}
			]}
		]
	})
	if (!chat) {
		return res.status(404).send('not found chat with topic')
	}

	req.body.inviteeId = req.user.id
	req.body.chatId = chat.id

	let message

	try {
		message = await Message.create(_.pick(req.body, ['text', 'inviteeId', 'chatId', 'fileId']))
	} catch (err) {
		return next(err)
	}
	let file
	if (req.body.fileId) {
		file = await File.findOne({where: {id: req.body.fileId}})
	}

	const user = _.find(chat.get('invitee').get('friends'), {id: chat.userId})

	let sound = 'default'
	let useSound = true
	if (_.hasIn(user, 'device.useSound')) {
		useSound = user.get('device').useSound
	}
	if (useSound === false) {
		sound = null
	}

	try {
		fcm.send(chat.topic, {
			notification: {
				title: message.text,
				body: user.UserInvitee.name,
				sound
			},
			data: {
				id: message.id,
				category: 'message',
				categoryId: chat.id,
				userId: req.user.id,
				userType: 'invitee',
				fileUrl: (file) ? file.url() : null
			}
		})
	} catch (err) {
		logger.error(err)
		return next(err)
	}

	return res.json(_.chain(message.toJSON()).extend({
		file: (file) ? file.toRes() : null
	}).value())
})

router.get('/invitee/chats', auth.needsInviteeLogin, async (req, res) => {
	let chats = await Chat.findAll({
		order: [
			[{model: Message, as: 'messages'}, 'id', 'DESC']
		],
		where: {inviteeId: req.user.id},
		include: [
			{model: Message, as: 'messages'},
			{model: User, as: 'user'}
		]
	})

	chats = chats.map(chat => {
		return _.chain(chat.toJSON())
		.omit(['user'])
		.extend({
			hasInviteeMessage: true,
			messages: chat.get('messages')[0],
			unreadMessageLength: _.filter(chat.get('messages'), message => {
				return message.inviteeId === null && message.isRead === false
			}).length,
			chatUserName: (chat.get('user')) ? chat.get('user').nickname : null
		})
		.value()
	})

	return res.json(chats)
})

router.put('/messages/read', auth.needsLogin, async (req, res, next) => {
	try {
		await Message.update({isRead: true}, {where: {id: {$in: req.body.ids}}})
	} catch (err) {
		return next(err)
	}

	return res.status(200).end()
})

router.get('/chats/:id/messages', auth.needsLogin, async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 1000
	const offset = (limit * (parseInt(req.query.page, 10) - 1)) || 0
	const id = parseInt(req.params.id, 10)
	let chat

	if (req.user.email) {
		chat = await Chat.findOne({where: {id, userId: req.user.id}})
	}
	if (req.user.code) {
		chat = await Chat.findOne({where: {id, inviteeId: req.user.id}})
	}

	if (!chat) {
		return res.status(404).send('Not found chat')
	}
	const messages = await Message.findAll({
		order: [['id', 'desc']],
		where: {chatId: chat.id},
		include: [
			{model: File, as: 'file'}
		],
		limit,
		offset
	})

	await Promise.all(messages.map(message => {
		if (req.user.email && message.userId !== req.user.id) {
			return message.update({isRead: true})
		}
		if (req.user.code && message.inviteeId !== req.user.id) {
			return message.update({isRead: true})
		}
		return Promise.resolve()
	}))

	return res.json(messages.map(o => o.toRes()))
})

router.get('/messages/:id', auth.needsLogin, async (req, res) => {
	const id = parseInt(req.params.id, 10)

	const message = await Message.findOne({
		where: {id}
	})

	return res.json(message.toJSON())
})

module.exports = router
