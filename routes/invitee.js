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
			await coolsms.send(invitee.phone, `${invitee.name}님의 친구중에서 ${invitee.name}님과 대화를 하고 싶어하는 분이 있습니다. 닉네임이 ${req.user.nickname}님이며 ${invitee.name}님과 대화를 하고 싶어서 대화방으로 초대를 하였습니다.
익명채팅 앱 '누굴까'를 설치하면 ${req.user.nickname}님과 곧바로 채팅을 할 수 있습니다.
설치 후 최초 로그인 시 아래의 초대코드를 입력해 주세요.
초대코드: ${invitee.code}

'누굴까'는 ‘내가 아는 사람과 익명으로 채팅하는 메신저' 입니다. 앱마켓에서 '누굴까'로 검색하여 직접 설치하거나 아래의 링크를 누르면 앱마켓으로 이동할 수 있습니다.(스팸이나 피싱이 아니니 안심하셔도 됩니다)
http://admin.nuguga.kr/app/app
`, 'LMS')
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
			await coolsms.send(invitee.phone, `${invitee.name}님의 친구중에서 ${invitee.name}님과 대화를 하고 싶어하는 분이 있습니다. 닉네임이 ${req.user.nickname}님이며 ${invitee.name}님과 대화를 하고 싶어서 대화방으로 초대를 하였습니다.
익명채팅 앱 '누굴까'를 설치하면 ${req.user.nickname}님과 곧바로 채팅을 할 수 있습니다.
설치 후 최초 로그인 시 아래의 초대코드를 입력해 주세요.
초대코드: ${invitee.code}

'누굴까'는 ‘내가 아는 사람과 익명으로 채팅하는 메신저' 입니다. 앱마켓에서 '누굴까'로 검색하여 직접 설치하거나 아래의 링크를 누르면 앱마켓으로 이동할 수 있습니다.(스팸이나 피싱이 아니니 안심하셔도 됩니다)
http://admin.nuguga.kr/app/app
`, 'LMS')
		} catch (err) {
			return next(err)
		}
	}

	return res.json(_.chain(chat.toJSON())
		.extend({name: req.body.name})
		.value())
})

module.exports = router
