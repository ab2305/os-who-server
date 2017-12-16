/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const moment = require('moment')
const passport = require('passport')
const auth = require('../middlewares/auth')
const Device = require('../models').Device
const fcm = require('../lib/fcm')
const User = require('../models').User
const UserInvitee = require('../models').UserInvitee
const Note = require('../models').Note
const Notice = require('../models').Notice

const router = express.Router()

router.post('/user/login', passport.authenticate('userStrategy', {session: true}), async (req, res) => {
	await req.user.update({lastLoginedAt: new Date()})
	return res.json(req.user.toRes())
})

router.post('/invitee/login', passport.authenticate('inviteeStrategy', {session: true}), async (req, res) => {
	if (req.user.logined === false) {
		await req.user.update({logined: true, loginedAt: new Date()})

		const userInvitees = await UserInvitee.findAll({
			where: {inviteeId: req.user.id},
			include: [
				{model: User, as: 'user', include: [
					{model: Device, as: 'device'}
				]}
			]
		})

		await Promise.all(userInvitees.map(o => {
			let sound = 'default'
			let useSound = true
			if (_.hasIn(o, 'user.device.useSound')) {
				useSound = o.user.device.useSound
			}
			if (useSound === false) {
				sound = null
			}
			return fcm.send(`user_${o.userId}`, {
				notification: {
					title: `${req.user.name}님이 누굴까를 설치하였습니다.`,
					body: `${req.user.name}님이 누굴까를 설치하였습니다. 이제 마음껏 채팅을 해보세요.`,
					sound
				},
				data: {
					category: 'note'
				}
			})
		}))
	}
	return res.json(req.user.toRes())
})

router.get('/me', auth.needsLogin, async (req, res) => {
	let hasUnreadNotes = false
	if (req.user.email) {
		const notes = await Note.findAll({
			where: {isRead: false, userId: req.user.id}
		})

		if (!_.isEmpty(notes)) {
			hasUnreadNotes = true
		}
	}
	const notices = await Notice.findAll({
		where: {
			createdAt: {
				$lt: moment().toDate(),
				$gt: moment().subtract(1, 'days').toDate()
			}
		},
		order: [['id', 'desc']],
		limit: 1
	})

	let lastNoticeId = null
	if (!_.isEmpty(notices)) {
		lastNoticeId = notices[0].id
	}
	return res.json(_.chain(req.user.toRes())
		.extend({
			hasUnreadNotes,
			lastNoticeId
		})
		.value())
})

router.delete('/me', auth.needsLogin, async (req, res) => {
	await new Promise((resolve, reject) =>
		req.session.destroy(err => err ? reject(err) : resolve()))
	return res.send('Logouted')
})

module.exports = router
