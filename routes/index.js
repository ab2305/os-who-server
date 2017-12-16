/* eslint new-cap: 0 */

const path = require('path')
const glob = require('glob')
const _ = require('lodash')
const express = require('express')

// Routes sources are all js files in this directory except itself.
const routesGlob = path.posix.join(__dirname, '*.js')
const routesSrc = _.pull(glob.sync(routesGlob), __filename)

// Bind all express routers to single router.
const router = express.Router()

routesSrc.forEach(src => router.use('/', require(src)))

// Export this single router.
module.exports = router
