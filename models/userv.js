/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')
const appConfig = require('config').app


module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Userv', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},		
		singocnt: {type:Sequelize.INTEGER, defaultValue:0}
	})

}
