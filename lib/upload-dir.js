const path = require('path')
const appConfig = require('config').app

module.exports = () => path.resolve(__dirname, '..', appConfig.uploadDir)
