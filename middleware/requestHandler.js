import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError } from "../middleware/errorHandler.js";
import BaseController from "../common/controllers/baseController.js";
import { Obj } from "../common/helpers/obj.js";
import { Help } from "../common/helpers/helper.js";

const isRequestValid = (req) => req && (req.params || req.query || req.body);

export const requestHandler = (req, res, next) => {
	try {
		if (
			!isRequestValid(req) ||
			!res ||
			(req.params.hasOwnProperty("id") && !req.params.id) ||
			(req.params.hasOwnProperty("userId") && !req.params.userId)
			/**
			 * check other necessary request params
			 */
		) {
			return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.OTHER, ENTITY.None, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
		}
		if (req.query) {
			Help.parseQueryParams(req.query);
		}

		BaseController.request = req;
		BaseController.response = res;
		next();
	} catch (err) {
		next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.UNKNOWN, ENTITY.None, err.userMessage, err.message));
	}
};
