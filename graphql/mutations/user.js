const _ = require('lodash')
const User = require('../../models').User
const Item = require('../../models').Item

const {userType, userInputType} = require('../types/user')

module.exports = {
	createUser: {
		type: userType,
		description: 'Creates a new user',
		args: {
			data: {type: userInputType}
		},
		resolve: (obj, {data}) => {
			if (!_.isString(data.password) || data.password.length < 4) {
				throw new Error('Wrong password format')
			}
			return User.create(data)
				.then(user => user.setPassword(data.password))
				.then(user => {
					return Item.init(user.id)
						.then(() => user)
				})
				.catch(err => {
					if (err.name === 'SequelizeUniqueConstraintError') {
						throw new Error('Unique constraint error')
					}
					throw err
				})
		}
	}
}
