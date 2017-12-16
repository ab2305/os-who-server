const Sequelize = require('sequelize')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('UserInvitee', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		name: {type: Sequelize.STRING, allowNull: false},
		invitationCount: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1}
	})

	defineRelationship(() => {
		models.UserInvitee.belongsTo(models.User, {as: 'user', foreignKey: 'userId'})
		models.UserInvitee.belongsTo(models.Invitee, {as: 'invitee', foreignKey: 'inviteeId'})
	})
}
