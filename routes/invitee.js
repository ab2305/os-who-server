/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const coolsms = require('../lib/coolsms')
const Chat = require('../models').Chat
const Invitee = require('../models').Invitee
const UserInvitee = require('../models').UserInvitee

const router = express.Router()

router.post('/invitee', auth.needsUserLogin, async (req, res, next) => {
	req.body.phone = req.body.phone.replace(/-/g, '')
	let invitee = await Invitee.findOne({
		where: {phone: req.body.phone}
	})

	let chat
	if (invitee) {
		// Exist invitee
		await invitee.regenerateCode()
		let userInvitee = await UserInvitee.findOne({
			where: {userId: req.user.id, inviteeId: invitee.id}
		})
		if (!userInvitee) {
			userInvitee = await UserInvitee.create({
				inviteeId: invitee.id,
				userId: req.user.id,
				name: req.body.name
			})
		}
		const invitationCount = userInvitee.invitationCount + 1
		await invitee.update(_.pick(req.body, ['name']))

		await userInvitee.update({invitationCount})

		if (invitationCount >= 3) {
			return res.status(400).end()
		}

		chat = await Chat.findOne({where: {
			userId: req.user.id,
			inviteeId: invitee.id
		}})

		if (!chat) {
			chat = await Chat.create({
				userId: req.user.id,
				inviteeId: invitee.id,
				topic: `${req.user.id}-${invitee.phone}`
			})
		}

		// Coolsms sending message
		try {
			await coolsms.send(invitee.phone, "${invitee.name}님 안녕하세요. ${invitee.name}님을 알고 있는 ${req.user.nickname}라는 닉네임을 쓰는 분이 ${invitee.name}님과 1:1 대화를 하고 싶어서 대화방으로 초대를 하였습니다.
익명채팅 앱 '누굴까'를 설치하면 ${req.user.nickname}님과 곧바로 채팅을 할 수 있습니다.
설치 후 최초 로그인 시 아래의 인증코드를 입력해 주세요.
인증코드: ${invitee.code}

'누굴까'는 ‘초대한 사람은 상대방을 알지만 상대방은 초대한 사람을 모르는 채 서로 대화하는 익명 채팅 메신저' 입니다.
http://admin.nuguga.kr/app/app
", 'LMS')
		} catch (err) {
			return next(err)
		}
	}

	if (!invitee) {
		// Non-exist invitee
		invitee = await Invitee.create(_.pick(req.body, ['phone', 'name']))
		await UserInvitee.create({
			inviteeId: invitee.id,
			userId: req.user.id,
			name: invitee.name
		})
		try {
			chat = await Chat.create({
				userId: req.user.id,
				inviteeId: invitee.id,
				topic: `${req.user.id}-${invitee.phone}`
			})
		} catch (err) {
			if (err.name !== 'SequelizeUniqueConstraintError') {
				return next(err)
			}
		}

		// Coolsms sending message
		try {
			await coolsms.send(invitee.phone, "${invitee.name}님 안녕하세요. ${invitee.name}님을 알고 있는 ${req.user.nickname}라는 닉네임을 쓰는 분이 ${invitee.name}님과 1:1 대화를 하고 싶어서 대화방으로 초대를 하였습니다.
익명채팅 앱 '누굴까'를 설치하면 ${req.user.nickname}님과 곧바로 채팅을 할 수 있습니다.
설치 후 최초 로그인 시 아래의 인증코드를 입력해 주세요.
인증코드: ${invitee.code}

'누굴까'는 ‘초대한 사람은 상대방을 알지만 상대방은 초대한 사람을 모르는 채 서로 대화하는 익명 채팅 메신저' 입니다.
http://admin.nuguga.kr/app/app
", 'LMS')
		} catch (err) {
			return next(err)
		}
	}

	return res.json(_.chain(chat.toJSON())
		.extend({name: req.body.name})
		.value())
})

module.exports = router
