/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Message', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		text: {type: Sequelize.STRING(512), allowNull: false},
		isRead: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
		status : {type : Sequelize.STRING(1), allowNull : false},
		pretext : {type : Sequelize.STRING(512), allowNull : true}
	}, {

		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON()).extend({
					file: (this.file) ? this.file.toRes() : null
				}).value()
			}
		}
	})

	defineRelationship(() => {
		models.Message.belongsTo(models.Chat, {as: 'chat', foreignKey: {name: 'chatId', allowNull: false}, onDelete: 'CASCADE'})
		models.Message.belongsTo(models.Invitee, {as: 'invitee', foreignKey: {name: 'inviteeId', allowNull: true}, onDelete: 'CASCADE'})
		models.Message.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: true}, onDelete: 'CASCADE'})
		models.Message.belongsTo(models.File, {as: 'file', foreignKey: {name: 'fileId', allowNull: true}, onDelete: 'SET NULL'})
	})
}
