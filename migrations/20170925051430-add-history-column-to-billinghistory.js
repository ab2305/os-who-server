/* eslint new-cap: 0 */
'use strict'

const Item = require('../models/').Item

module.exports = {
	up: (queryInterface, Sequelize, done) => {
		return queryInterface.addColumn(Item.getTableName(), 'itemHistories', {type: Sequelize.JSON, defaultValue: {stamp: [], subscription: []}})
		.then(() => done())
	},

	down: (queryInterface, Sequelize, done) => {
		return queryInterface.removeColumn(Item.getTableName(), 'itemHistories')
		.then(() => done())
	}
}
