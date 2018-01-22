/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Chat', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		topic: {type: Sequelize.STRING(512), allowNull: false, unique: true},
		useyn: {type : Sequelize.STRING(1), allowNull: false, defaultValue: 'Y'}
	})

	defineRelationship(() => {
		models.Chat.belongsTo(models.Invitee, {as: 'invitee', foreignKey: {name: 'inviteeId', allowNull: false}})
		models.Chat.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: true}, onDelete: 'SET NULL'})
		models.Chat.hasMany(models.Message, {as: 'messages', foreignKey: {name: 'chatId', allowNull: false}, onDelete: 'CASCADE'})
	})
}
