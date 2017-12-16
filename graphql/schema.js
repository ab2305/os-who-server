const _ = require('lodash')
const {GraphQLSchema, GraphQLObjectType} = require('graphql')
const billingHistoryQuery = require('./queries/billing-history')
const itemQuery = require('./queries/item')
const userQuery = require('./queries/user')
const userMutation = require('./mutations/user')

const rootSchema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'schemaQueryType',
		fields: _.assign({}, billingHistoryQuery, userQuery, itemQuery)
	}),
	mutation: new GraphQLObjectType({
		name: 'schemaMutationType',
		fields: _.assign({}, userMutation)
	})
})

module.exports = rootSchema
