/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Device', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		useVibrate: {type: Sequelize.BOOLEAN, defaultValue: false},
		usePush: {type: Sequelize.BOOLEAN, defaultValue: true},
		useSound: {type: Sequelize.BOOLEAN, defaultValue: true}
	})

	defineRelationship(() => {
		models.Chat.belongsTo(models.Invitee, {as: 'invitee', foreignKey: {name: 'inviteeId', allowNull: true}})
		models.Chat.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: true}})
	})
}
