const Unauthorized = require('../lib/error').Unauthorized

const createAuthMiddleware = f =>
	(req, res, next) => f(req) ? next() : next(new Unauthorized())

const needsLogin = req => req.user
const needsUserLogin = req => needsLogin(req) && req.user.get('email')
const needsInviteeLogin = req => needsLogin(req) && req.user.get('code')
const needsAdmin = req => needsLogin(req) && req.user.get('admin')

module.exports = {
	needsLogin: createAuthMiddleware(needsLogin),
	needsAdmin: createAuthMiddleware(needsAdmin),
	needsUserLogin: createAuthMiddleware(needsUserLogin),
	needsInviteeLogin: createAuthMiddleware(needsInviteeLogin)
}
