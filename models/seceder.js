/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = defineModel => {
	defineModel('Seceder', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		email: {type: Sequelize.STRING, unique: true},
		name: {type: Sequelize.STRING, allowNull: false},
		nickname: {type: Sequelize.STRING(512)},
		gender: {type: Sequelize.ENUM('male', 'female'), defaultValue: null},
		birthYear: {type: Sequelize.STRING},
		phone: {type: Sequelize.STRING, unique: true, allowNull: false},
		verified: {type: Sequelize.BOOLEAN, defaultValue: false},
		userCreatedAt: {type: Sequelize.DATE, allowNull: false}
	})
}
