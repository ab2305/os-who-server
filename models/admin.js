module.exports = (defineModel, defineRelationship, models) => {
	defineModel('Admin', {}, {
		indexes: [
			{
				unique: true,
				fields: ['userId']
			}
		]
	})
	defineRelationship(() => {
		models.Admin.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: true}, onDelete: 'CASCADE'})
	})
}
