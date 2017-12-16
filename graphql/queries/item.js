const {resolver} = require('graphql-sequelize')
const {GraphQLInt, GraphQLNonNull} = require('graphql')
const Item = require('../../models').Item

const {itemType} = require('../types/item')

module.exports = {
	item: {
		type: itemType,
		args: {
			userId: {type: new GraphQLNonNull(GraphQLInt)}
		},
		resolve: resolver(Item, {
			before: (findOptions, args, context) => {
				if (!context.user) {
					throw new Error('Need login')
				}

				if (!context.user.get('admin') && context.user.id !== args.userId) {
					throw new Error('Unauthorized')
				}
			}
		})
	}
}
