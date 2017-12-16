/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('UsingHistory', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		usedStamp: {type: Sequelize.INTEGER, allowNull: false}
	}, {

		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.value()
			}
		}
	})

	defineRelationship(() => {
		models.UsingHistory.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: false}, onDelete: 'CASCADE'})
		models.UsingHistory.belongsTo(models.UserInvitee, {as: 'userInvitee', foreignKey: {name: 'userInviteeId', allowNull: false}, onDelete: 'CASCADE'})
	})
}
