/* eslint new-cap: 0 */

const fs = require('fs')
const path = require('path')
const appConfig = require('config').app
const mkdirp = require('mkdirp')
const Sequelize = require('sequelize')
const uploadDir = require('../lib/upload-dir')

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('File', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		name: {type: Sequelize.STRING(512), allowNull: false},
		size: {type: Sequelize.INTEGER, allowNull: false}
	}, {
		classMethods: {
			upload(uploadedFile) {
				return models.File
				.create({
					name: uploadedFile.originalname,
					size: uploadedFile.size
				})
				.then(file => file.mkdir())
				.then(file => file.saveFile(uploadedFile))
			}
		},

		instanceMethods: {
			dir() {
				return path.join(uploadDir(), String(this.get('id')))
			},
			mkdir() {
				return new Promise((resolve, reject) => {
					mkdirp(this.dir(), err => err ? reject(err) : resolve(this))
				})
			},
			saveFile(uploadedFile) {
				return new Promise((resolve, reject) => {
					fs.rename(uploadedFile.path, this.path(), err => err ? reject(err) : resolve(this))
				})
			},
			path() {
				return path.join(this.dir(), this.get('name'))
			},
			url() {
				const id = this.get('id')
				const name = this.get('name')
				return encodeURI(`${appConfig.host}/uploads/${id}/${name}`)
			},
			toRes() {
				return {
					id: this.get('id'),
					name: this.get('name'),
					size: this.get('size'),
					url: this.url()
				}
			}
		}
	})
}
