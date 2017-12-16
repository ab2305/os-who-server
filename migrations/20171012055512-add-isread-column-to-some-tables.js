/* eslint new-cap: 0 */
'use strict'

const Note = require('../models/').Note

module.exports = {
	up: (queryInterface, Sequelize, done) => {
		return queryInterface.addColumn(Note.getTableName(), 'isRead', {type: Sequelize.BOOLEAN, defaultValue: false})
		.then(() => done())
	},

	down: (queryInterface, Sequelize, done) => {
		return queryInterface.removeColumn(Note.getTableName(), 'isRead')
		.then(() => done())
	}
}
