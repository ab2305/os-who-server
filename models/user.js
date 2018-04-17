/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')
const appConfig = require('config').app
const scrypt = require('scrypt')

const scryptParams = scrypt.paramsSync(0.1)

class PasswordError extends Error {
	constructor(message) {
		super(message)
		this.name = 'PasswordError'
	}
}

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('User', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		email: {type: Sequelize.STRING, unique: true},
		password: {type: Sequelize.STRING},
		name: {type: Sequelize.STRING, allowNull: false},
		nickname: {type: Sequelize.STRING(512)},
		gender: {type: Sequelize.ENUM('male', 'female'), defaultValue: null},
		birthYear: {type: Sequelize.STRING},
		phone: {type: Sequelize.STRING, unique: true, allowNull: false},
		lastLoginedAt: {type: Sequelize.DATE, allowNull: false, defaultValue: new Date()},
		verified: {type: Sequelize.BOOLEAN, defaultValue: false}
	}, {
		classMethods: {
			generatePassword(plainText) {
				return new Promise((resolve, reject) => {
					const key = plainText + appConfig.passwordSalt
					scrypt.kdf(key, scryptParams, (error, hash) => {
						if (error) {
							reject(error)
						}
						resolve(hash.toString('base64'))
					})
				})
			}
		},

		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.omit(['password'])
				.extend({
					item: (this.item) ? this.item.toRes() : null
				})
				.value()
			},
			isValidPassword(password) {
				return _.isString(password) && password.length >= 4
			},
			setPassword(plainText) {
				if (!this.isValidPassword(plainText)) {
					return Promise.reject(new PasswordError('password too short'))
				}

				return models.User
				.generatePassword(plainText)
				.then(hash => this.set('password', hash).save())
			},
			verifyPassword(plainText) {
				const key = Buffer.from(this.get('password'), 'base64')
				const comparedKey = Buffer.from(plainText + appConfig.passwordSalt)
				return new Promise((resolve, reject) => {
					scrypt.verifyKdf(key, comparedKey, (error, result) => {
						if (error) {
							return reject(error)
						}
						if (!result) {
							return reject(new PasswordError('WrongPassword'))
						}
						resolve(this)
					})
				})
			}
		}
	})

	defineRelationship(() => {
		models.User.belongsToMany(models.Invitee, {as: 'friends', through: models.UserInvitee, foreignKey: 'userId'})
		models.User.hasOne(models.Item, {as: 'item', foreignKey: {name: 'userId', allowNull: false, unique: true}, onDelete: 'CASCADE'})
		models.User.hasOne(models.UserInformation, {as: 'userInformation', foreignKey: {name: 'userId', allowNull: false, unique: true}, onDelete: 'CASCADE'})
		models.User.hasOne(models.Admin, {as: 'admin', foreignKey: {name: 'userId', allowNull: true}, onDelete: 'CASCADE'})
		models.User.hasOne(models.Device, {as: 'device', foreignKey: {name: 'userId', allowNull: true}, onDelete: 'CASCADE'})
		models.User.hasMany(models.BillingHistory, {as: 'billingHistories', foreignKey: {name: 'userId', allowNull: false}, onDelete: 'CASCADE'})
		models.User.hasMany(models.UsingHistory, {as: 'usingHistories', foreignKey: {name: 'userId', allowNull: false}, onDelete: 'CASCADE'})
		models.User.hasMany(models.UserInvitee, {as: 'userInvitees', foreignKey: 'userId'})
		models.User.hasOne(models.User_V, {as : 'user_v', foreignKey:'id'})
	})
}
