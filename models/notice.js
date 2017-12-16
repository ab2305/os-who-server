/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = defineModel => {
	defineModel('Notice', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		title: {type: Sequelize.STRING(512), allowNull: false},
		body: {type: Sequelize.TEXT, allowNull: false},
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
