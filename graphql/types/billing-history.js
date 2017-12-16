const {attributeFields} = require('graphql-sequelize')
const {GraphQLObjectType} = require('graphql')
const BillingHistory = require('../../models').BillingHistory

const billingHistoryType = new GraphQLObjectType({
	name: 'BillingHistory',
	description: 'billingHistory',
	fields: attributeFields(BillingHistory)
})

module.exports = {
	billingHistoryType
}
