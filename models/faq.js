/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = defineModel => {
	defineModel('Faq', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		title: {type: Sequelize.STRING(512), allowNull: false},
		body: {type: Sequelize.TEXT, allowNull: false}
	}, {
		instanceMethods: {
			toRes() {
				return this.toJSON()
			}
		}
	})
}
