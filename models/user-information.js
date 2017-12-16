/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('UserInformation', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		memo: {type: Sequelize.TEXT},
		status: {type: Sequelize.ENUM('good', 'general', 'warnning'), defaultValue: 'general'}
	}, {
		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.value()
			}
		}
	})

	defineRelationship(() => {
		models.UserInformation.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: false}, onDelete: 'CASCADE'})
	})
}
