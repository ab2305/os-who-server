/* eslint new-cap: 0 */

const _ = require('lodash')
const moment = require('moment')
const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Item', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		stamp: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
		subscriptionStartedAt: {type: Sequelize.DATE},
		subscriptionEndedAt: {type: Sequelize.DATE},
		itemHistories: {type: Sequelize.JSON, defaultValue: {stamp: [], subscription: []}},
		subscribed: {type: Sequelize.VIRTUAL, get() {
			if (this.subscriptionEndedAt > moment.now()) {
				return true
			}
			return false
		}}
	}, {
		classMethods: {
			init(userId) {
				return this.create({
					userId,
					stamp: 10
				})
			}
		},

		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.value()
			}
		}
	})

	defineRelationship(() => {
		models.Item.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: false, unique: true}, onDelete: 'CASCADE'})
	})
}
