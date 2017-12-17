/* eslint new-cap: 0 */

const _ = require('lodash')
const express = require('express')
const auth = require('../middlewares/auth')
const block = require('../models').Block
const Chat = require('../models').Chat

const router = express.Router()

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

	await Chat.update({useyn: 'N'})
	
	return res.json({useyn: 'N'})
})

module.exports = router
