const {attributeFields} = require('graphql-sequelize')
const {GraphQLObjectType, GraphQLString, GraphQLInputObjectType} = require('graphql')
const Item = require('../../models').Item

const itemType = new GraphQLObjectType({
	name: 'Item',
	description: 'item',
	fields: attributeFields(Item)
})

const itemInputType = new GraphQLInputObjectType({
	name: 'itemInput',
	fields: () => ({
		stamp: {type: GraphQLString},
		subscriptionStartedAt: {type: GraphQLString},
		subscriptionEndedAt: {type: GraphQLString}
	})
})

module.exports = {
	itemType,
	itemInputType
}
