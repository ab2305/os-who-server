const {resolver, attributeFields} = require('graphql-sequelize')
const {GraphQLInputObjectType, GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLList} = require('graphql')
const User = require('../models').User

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

const userSchema = {
	query: new GraphQLObjectType({
		name: 'userQueryType',
		fields: {
			user: {
				type: userType,
				args: {
					id: {type: GraphQLInt},
					email: {type: GraphQLString},
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
	}),
	mutation: new GraphQLObjectType({
		name: 'userMutationType',
		fields: {
			createUser: {
				type: userType,
				description: 'Creates a new user',
				args: {
					data: {type: userInputType}
				},
				resolve: (obj, {data}) => {
					return User.create(data)
						.then(user => user.setPassword(data.password))
						.catch(err => {
							if (err.name === 'SequelizeUniqueConstraintError') {
								throw new Error('Unique constraint error')
							}
							throw err
						})
				}
			}
		}
	})
}

module.exports = userSchema
