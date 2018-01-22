/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')
const randomstring = require('randomstring')

const generateCode = () => randomstring.generate({length: 4, charset: 'numeric'})

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Invitee', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		name: {type: Sequelize.STRING, allowNull: false},
		phone: {type: Sequelize.STRING, allowNull: false, unique: true},
		loginedAt: {type: Sequelize.DATE},
		code: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: generateCode
		},
		logined: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
	}, {
		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.omit(['code'])
				.value()
			},
			regenerateCode() {
				return this.update({code: generateCode()})
			}
		}
	})

	defineRelationship(() => {
		models.Invitee.belongsToMany(models.User, {as: 'friends', through: models.UserInvitee, foreignKey: 'inviteeId'})
		models.Invitee.hasOne(models.Device, {as: 'device', foreignKey: {name: 'inviteeId', allowNull: true}, onDelete: 'CASCADE'})
	})
}
