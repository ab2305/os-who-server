'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const dbConfig = require('config').db
const Sequelize = require('sequelize')

const connection = new Sequelize(
	dbConfig.database,
	dbConfig.username,
	dbConfig.password,
	_.chain(dbConfig)
	.omit(['database', 'username', 'password'])
	.extend({
		dialect: 'postgres'
	})
	.value()
)

// Initialize models
const models = {connection}
const relationships = []

const defineModel = (name, schema, option) => {
	option = option ? option : {}
	models[name] = connection.define(name, schema, option)
}

const defineRelationship = (relationship => relationships.push(relationship))

fs.readdirSync(__dirname).forEach(model => {
	const ext = path.extname(model)
	const basename = path.basename(model, ext)
	if (ext !== '.js' || basename === 'index') {
		return
	}
	require('../models/' + basename)(defineModel, defineRelationship, models)
})

relationships.forEach(relationshipDefinition => relationshipDefinition())

module.exports = models
