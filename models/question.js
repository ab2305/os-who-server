const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Question', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		body: {type: Sequelize.TEXT, allowNull: false},
		comment: {type: Sequelize.TEXT}
	}, {
		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.omit(['fileId'])
				.extend({
					user: (this.user) ? this.user.toRes() : null,
					invitee: (this.invitee) ? this.invitee.toRes() : null,
					file: (this.file) ? this.file.toRes() : null
				})
				.value()
			}
		}
	})

	defineRelationship(() => {
		models.Question.belongsTo(models.Invitee, {as: 'invitee', foreignKey: {name: 'inviteeId', allowNull: true}, onDelete: 'CASCADE'})
		models.Question.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: true}, onDelete: 'CASCADE'})
		models.Question.belongsTo(models.File, {as: 'file', foreignKey: {name: 'fileId', allowNull: true}, onDelete: 'SET NULL'})
	})
}
