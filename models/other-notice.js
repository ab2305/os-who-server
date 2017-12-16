/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = defineModel => {
	defineModel('OtherNotice', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		title: {type: Sequelize.STRING(512)},
		category: {type: Sequelize.ENUM('term', 'privacy'), allowNull: false},
		body: {type: Sequelize.TEXT},
		isTop: {type: Sequelize.BOOLEAN, defaultValue: false},
		viewCount: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}
	}, {
		instanceMethods: {
			toRes() {
				return this.toJSON()
			}
		}
	})
}
