const fs = require('fs')
const path = require('path')

const cliConfig = {
	development: require('config').db,
	production: require('config').db,
	test: require('config').db
}

const configPath = path.join(__dirname, '../config/config.json')
fs.writeFileSync(configPath, JSON.stringify(cliConfig, null, 2))
