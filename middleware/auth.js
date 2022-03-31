import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError } from "../middleware/errorHandler.js";
import { REQ_TYPE, ROLES } from "../common/helpers/constants.js";
import BaseController from "../common/controllers/baseController.js";

class Auth {
	constructor() {}
	/*
	AUTH Middleware Core Functions Begin
	*/
	ensureAll = (funcs) => (req, res, next) => {
		let results = funcs.map((f) => f(req));
		if (results.includes(false)) {
			this.throwUnauthorizedError(next);
		} else {
			next();
		}
	};
	ensureAny = (funcs) => (req, res, next) => {
		let results = funcs.map((f) => f(req));
		if (!results.includes(true)) {
			this.throwUnauthorizedError(next);
		} else {
			next();
		}
	};
	ensureOne = (func) => (req, res, next) => {
		if (func(req)) {
			next();
		} else {
			this.throwUnauthorizedError(next);
		}
	};
	ensureNone = (req, res, next) => next();
	
	/*
	AUTH Middleware Core Functions End
	*/

    /**
	 * Define Auth functions here
	 */
	isAdmin = (req) => !!(this.isLoggedIn && req.session.userRole === ROLES.ADMIN);
	isUserHimself = (req) => {
		let userId = req.params.userId ? req.params.userId : req.params.id;
		return this.isUser && userId === req.session.userId;
	};
	isUser = (req) => !!(this.isLoggedIn(req)); //can be combined with other contraints if necessary
	isLoggedIn = (req) => !!(req.session && req.session.userId);
	appendUserId = (req) => {
		if (!req.session.userId) {
			return false;
		}
		if (req.method === REQ_TYPE.GET) {
			if (req.body.filter) req.body.filter["userId"] = req.session.userId;
			else return false;
		}
		if (req.method === REQ_TYPE.POST ? REQ_TYPE.POST : req.method === REQ_TYPE.PUT) {
			req.body.data["user"] = req.session.userId;
		}
		return true;
	};


	// incase a vulnerable route is being called, call this method to destroy user session
	destroySessionAndCookie = () => {
		BaseController.response.cookie("userId", undefined);
		BaseController.request.session.destroy();
	};

	throwUnauthorizedError = (next) => next(new ServerError(ERRORS.UNAUTHORIZED_401, OPERATION.OTHER, ENTITY.None, ERROR_MESSAGES.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED));
}

export const AUTH = new Auth();
