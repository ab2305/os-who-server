const {attributeFields} = require('graphql-sequelize')
const {GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLInputObjectType} = require('graphql')
const User = require('../../models').User

const userType = new GraphQLObjectType({
	name: 'User',
	description: 'user',
	fields: attributeFields(User)
})

const userInputType = new GraphQLInputObjectType({
	name: 'userInput',
	fields: () => ({
		email: {type: new GraphQLNonNull(GraphQLString)},
		password: {type: new GraphQLNonNull(GraphQLString)},
		name: {type: new GraphQLNonNull(GraphQLString)},
		nickname: {type: new GraphQLNonNull(GraphQLString)},
		gender: {type: new GraphQLNonNull(GraphQLString)},
		birthYear: {type: new GraphQLNonNull(GraphQLString)},
		phone: {type: new GraphQLNonNull(GraphQLString)}
	})
})

module.exports = {
	userType,
	userInputType
}
