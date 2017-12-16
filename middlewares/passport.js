const LocalStrategy = require('passport-local').Strategy
const Admin = require('../models/').Admin
const User = require('../models/').User
const Invitee = require('../models/').Invitee
const Item = require('../models/').Item
const UnprocessableEntity = require('../lib/error').UnprocessableEntity

const userStrategyOptions = {
	usernameField: 'email',
	passwordField: 'password'
}

const inviteeStrategyOptions = {
	usernameField: 'phone',
	passwordField: 'code'
}

function serializeUser(user, done) {
	done(null, user)
}

function deserializeUser(storedUser, done) {
	User.findOne({
		where: {email: storedUser.email},
		include: [
			{model: Admin, as: 'admin'},
			{model: Item, as: 'item'}
		]
	})
	.then(user => {
		if (!user) {
			return Invitee.findOne({where: {phone: storedUser.phone}})
				.then(invitee => done(null, invitee))
		}
		return done(null, user)
	})
	.catch(done)
}

function userStrategyHandler(email, password, done) {
	User.findOne({
		where: {email},
		include: [
			{model: Admin, as: 'admin'},
			{model: Item, as: 'item'}
		]
	})
	.then(user => {
		if (!user) {
			throw new UnprocessableEntity('Undefined user')
		}
		return user.verifyPassword(password)
	})
	.then(result => {
		done(null, result)
	})
	.catch(err => {
		if (err.name === 'PasswordError') {
			throw new UnprocessableEntity('Wrong password')
		}
		done(err, false)
	})
	.catch(done)
}

function inviteeStrategyHandler(phone, code, done) {
	phone = phone.replace(/-/g, '')
	Invitee.findOne({
		where: {phone}
	})
	.then(invitee => {
		if (!invitee) {
			throw new UnprocessableEntity('Undefined invitee')
		}
		if (code !== invitee.code) {
			throw new UnprocessableEntity('wrong code')
		}
		return invitee
	})
	.then(result => {
		done(null, result)
	})
	.catch(err => done(err, false))
	.catch(done)
}

const userStrategy = new LocalStrategy(userStrategyOptions, userStrategyHandler)
const inviteeStrategy = new LocalStrategy(inviteeStrategyOptions, inviteeStrategyHandler)

module.exports = {
	serializeUser,
	deserializeUser,
	userStrategy,
	inviteeStrategy
}
