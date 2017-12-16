/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Note', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		title: {type: Sequelize.STRING(512), allowNull: false},
		isTop: {type: Sequelize.BOOLEAN, defaultValue: false},
		isRead: {type: Sequelize.BOOLEAN, defaultValue: false},
		body: {type: Sequelize.TEXT, allowNull: false}
	}, {
		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.extend({
					user: (this.user) ? this.user.toRes() : null
				})
				.value()
			}
		}
	})

	defineRelationship(() => {
		models.Note.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: false}, onDelete: 'CASCADE'})
	})
}
