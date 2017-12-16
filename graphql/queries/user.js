const {resolver} = require('graphql-sequelize')
const {GraphQLInt, GraphQLString, GraphQLList} = require('graphql')
const User = require('../../models').User

const {userType} = require('../types/user')

module.exports = {
	user: {
		type: userType,
		args: {
			id: {type: GraphQLInt},
			email: {type: GraphQLString},
			name: {type: GraphQLString},
			nickname: {type: GraphQLString}
		},
		resolve: resolver(User)
	},
	users: {
		type: new GraphQLList(userType),
		args: {
			email: {type: GraphQLString},
			name: {type: GraphQLString},
			nickname: {type: GraphQLString}
		},
		resolve: resolver(User)
	}
}
