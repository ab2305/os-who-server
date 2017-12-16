const {resolver} = require('graphql-sequelize')
const {GraphQLInt, GraphQLString, GraphQLList} = require('graphql')
const BillingHistory = require('../../models').BillingHistory

const {billingHistoryType} = require('../types/billing-history')

module.exports = {
	billingHistory: {
		type: billingHistoryType,
		args: {
			id: {type: GraphQLInt}
		},
		resolve: resolver(BillingHistory, {
			before: (findOptions, args, context) => {
				if (!context.user.get('admin') && context.user.id !== args.userId) {
					throw new Error('Unauthorized')
				}
			}
		})
	},
	billingHistories: {
		type: new GraphQLList(billingHistoryType),
		args: {
			userId: {type: GraphQLInt},
			orderBy: {
				type: new GraphQLList(new GraphQLList(GraphQLString))
			}
		},
		resolve: resolver(BillingHistory, {
			before: (findOptions, args, context) => {
				const options = Object.assign({order: []}, findOptions)
				if (args.orderBy) {
					options.order = options.order.concat(args.orderBy)
				}

				if (!context.user) {
					throw new Error('Need login')
				}
				if (!context.user.get('admin') && context.user.id !== args.userId) {
					throw new Error('Unauthorized')
				}
				return options
			}
		})
	}
}
