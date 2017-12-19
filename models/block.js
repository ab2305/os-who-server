/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('block_list', {
		idx: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		tid: {type: Sequelize.STRING(10), allowNull: false, unique: false},
		fid: {type: Sequelize.STRING(10), allowNull: false, unique: false}
	})

}
