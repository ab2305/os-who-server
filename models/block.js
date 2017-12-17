/* eslint new-cap: 0 */

const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Block', {
		result: {type: Sequelize.STRING(10), allowNull: false, unique: true}
	})

	defineRelationship(() => {
		models.Block.belongsTo(models.Invitee, {as: 'invitee', foreignKey: {name: 'inviteeId', allowNull: true}})
		models.Block.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: true}})
	})
}
