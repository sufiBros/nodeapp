import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError } from "./errorHandler.js";
const responseHandler = (req, res, next) => (err, result) => {
	if (err) {
		//errors are handled in controller
		return next(err);
	}
	if (Buffer.isBuffer(result)) {
		res.contentType("application/pdf");
	}
	if (req.path.includes("getCsv")) {
		res.contentType("application/csv");
	}
	if (result && result.redirect && result.url) {
		return res.redirect(result.url);
	}
	res.status(200).send(result);
};

export const queryHandler = (func, params) => (req, res, next) => {
	try {
		let paramArray = [];
		for (let i = 0; i < params.length; i++) {
			if (params[i].type === "url") {
				if (params[i].required && !req.params[params[i].name]) {
					throw new Error("Required parameter '" + params[i].name + "' did not found in request url params.");
				}
				paramArray[i] = req.params[params[i].name];
			}
			if (params[i].type === "query") {
				if (params[i].required && !req.query[params[i].name]) {
					throw new Error("Required parameter '" + params[i].name + "' did not found in request query params.");
				}
				paramArray[i] = req.query[params[i].name];
			}
			if (params[i].type === "body") {
				if (params[i].required && !req.body[params[i].name]) {
					throw new Error("Required parameter '" + params[i].name + "' did not found in request body.");
				}
				paramArray[i] = req.body[params[i].name];
			}
			if (params[i].type === "file") {
				if (params[i].required && !req.files[params[i].name]) {
					throw new Error("Required file '" + params[i].name + "' did not found in request files.");
				}
				paramArray[i] = req.files[params[i].name];
			}
		}
		if (!paramArray.length) {
			func(responseHandler(req, res, next));
		} else {
			func(...paramArray, responseHandler(req, res, next));
		}
	} catch (err) {
		return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.UNKNOWN, ENTITY.None, err.userMessage, err.message));
	}
};
