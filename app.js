const appConfig = require('config').app
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const graphqlHTTP = require('express-graphql')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const passport = require('passport')
const logger = require('./lib/logger')
const passportMiddleware = require('./middlewares/passport')
const uploadDir = require('./lib/upload-dir')
// Const ioServer = require('./lib/socket')

const app = express()

const sessionMiddleware = session({
	store: new RedisStore({host: appConfig.redisHost, pass: appConfig.redisPass, port: appConfig.redisPort}),
	resave: false,
	saveUninitialized: true,
	secret: appConfig.sessionSecret
})

app.use(cors({
	origin: true,
	credentials: true
}))

app.use(bodyParser.json())
app.use(cookieParser())
app.use(sessionMiddleware)

passport.serializeUser(passportMiddleware.serializeUser)
passport.deserializeUser(passportMiddleware.deserializeUser)
passport.use('userStrategy', passportMiddleware.userStrategy)
passport.use('inviteeStrategy', passportMiddleware.inviteeStrategy)
app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV !== 'production') {
	app.use((req, res, next) => {
		logger.silly('%s %s', req.method, req.path)
		next()
	})
}

app.use('/uploads', express.static(uploadDir()))

const graphqlSchema = require('./graphql/schema')

app.use('/59e5abcc7cc02378a797d732', graphqlHTTP({schema: graphqlSchema, graphiql: true}))

app.use(require('./routes'))

app.use(require('./middlewares/error-handler'))

module.exports = app
