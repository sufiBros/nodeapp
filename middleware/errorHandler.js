export class ServerError extends Error {
	userMessage = undefined;
	constructor(error, operation, model, userMessage, devMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR) {
		super(devMessage);
		if (!userMessage) {
			userMessage = ERROR_MESSAGES.AUTO;
		}
		this.userMessage =
			userMessage !== ERROR_MESSAGES.AUTO
				? userMessage
				: operation === OPERATION.UNKNOWN
				? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
				: "While " + operation + " " + model + " an Error occured.";
		this.statusCode = error.statusCode;
		this.status = error.status;
		Error.captureStackTrace(this, this.constructor);
	}
}

//User Readable errors
export class Exception extends Error {
	constructor(message) {
		super(message);
		this.userMessage = message;
	}
}

export function errorHandler(err, req, res, next) {
	err.statusCode = err.statusCode ? err.statusCode : 500;
	err.status = err.status ? err.status : "Internal Server Error";

	var error = { ...err, message: err.message };
	if (error.name === "CastError") error = handleCastErrorDB(error);
	if (error.code === 11000) error = handleDuplicateFieldsDB(error);
	if (error.name === "ValidationError") error = handleValidationErrorDB(error);

	if (!process.env.NODE_ENV === "production") {
		res.status(error.statusCode).json({
			status: error.status,
			message: error.userMessage,
		});
	} else {
		res.status(error.statusCode).json({
			statusCode: error.statusCode,
			status: error.status,
			message: error.message,
			userMessage: error.userMessage,
		});
	}
	// TODO: mongodb specific errors handling
}

//for async code blocks, no need for try catch anymore
export const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.UNKNOWN, ENTITY.None, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message);
};

const handleDuplicateFieldsDB = (err) => {
	const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
	const message = `Duplicate field value: ${value}. Please use anothe value!`;
	return new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.UNKNOWN, ENTITY.None, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);

	const message = `Invalid input data. ${errors.join(". ")}`;
	return new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.UNKNOWN, ENTITY.None, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message);
};
/**
 ********************* write your function like following**********************
 catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  if(!newTour){
    next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500,"Something hapenned"))
  }
  res.status(201).json({
    status: 'success',
    data: { tour: newTour }
  });
});
 */
export const ERRORS = {
	BAD_REQUEST_400: { status: "Bad Request", statusCode: "400" },
	UNAUTHORIZED_401: { status: "Unauthorized", statusCode: "401" },
	PAYMENT_REQUIRED_402: { status: "Payment Required", statusCode: "402" },
	FORBIDDEN_403: { status: "Forbidden", statusCode: "403" },
	NOT_FOUND_404: { status: "Not Found", statusCode: "404" },
	METHOD_NOT_ALLOWED_405: { status: "Method Not Allowed", statusCode: "405" },
	NOT_ACCEPTABLE_406: { status: "Not Acceptable", statusCode: "406" },
	PROXY_AUTHENTICATION_REQUIRED_407: {
		status: "Proxy Authentication Required",
		statusCode: "407",
	},
	REQUEST_TIMEOUT_408: { status: "Request Timeout", statusCode: "408" },
	CONFLICT_409: { status: "Conflict", statusCode: "409" },
	GONE_410: { status: "Request Gone", statusCode: "410" },
	REQUEST_ENTITY_TOO_LARGE_413: {
		status: "Request Entity Too Large",
		statusCode: "413",
	},
	REQUEST_URI_TOO_LONG_414: {
		status: "Request URI Too Long",
		statusCode: "414",
	},
	UNSUPPORTED_MEDIA_TYPE_415: {
		status: "Unsupported Media Type",
		statusCode: "415",
	},
	EXPRECTATION_FAILED_417: { status: "Expectation Failed", statusCode: "417" },
	UNPROCESSABLE_ENTITY_422: {
		status: "Unprocessable Entity",
		statusCode: "422",
	},
	UPGRADE_REQUIRED_426: { status: "Upgrade Required", statusCode: "426" },
	NO_RESPONSE_444: { status: "No Response", statusCode: "444" },
	INTERNAL_SERVER_ERROR_500: {
		status: "Internal Server Error",
		statusCode: "500",
	},
	BAD_GATEWAY_502: { status: "Bad Gateway", statusCode: "502" },
	SERVICE_UNAVAILABLE_503: { status: "Service Unavailable", statusCode: "503" },
	GATEWAY_TIMEOUT_504: { status: "Gateway Timeout", statusCode: "504" },
	INSUFFICIENT_STORAGE_507: {
		status: "Insufficient Storage",
		statusCode: "507",
	},
	NETWORK_AUTHENTICATION_REQUIRED_511: {
		status: "Network Authentication Required",
		statusCode: "511",
	},
	NETWORK_READ_TIMEOUT_ERROR_598: {
		status: "Network read timeout error",
		statusCode: "598",
	},
	NETWORK_CONNECTION_TIMEOUT_ERROR_599: {
		status: "Network connect timeout error",
		statusCode: "599",
	},
};

export const ERROR_MESSAGES = {
	AUTO: "AUTO",
	UNAUTHORIZED: "The User is Unauthorized",
	INVALID_EMAIL: "The Email Adress is invalid.",
	INVALID_PASSWORD: "The Password is ivalid, please make sure to enter atleast one capital case letter, a number and a special character.",
	INCORRECT_PASSWORD: "The Password is incorrect.",
	EMAIL_OR_PASSWORD_INCORRECT: "Either Email or Password is incorrect",
	USER_NOT_FOUND: "The User does not exist.",
	USER_NOT_VERIFIED: "The User is not verified, please check your email to get the verify link.",
	INTERNAL_SERVER_ERROR: "An Error occured, please try again or contact admin.",
	INVALID_EMAIL_SENDER_RECEIVER: "Invalid sender or receiver email adress ",
	EMAIL_SUBJECT_UNDEFINED: "Email Subject is not defined.",
	ENTITY_NOT_FOUND: "The required resource is not found.",
	INVALID_REQUEST_PARAMS: "Invalid Request Parameters",
	INVALID_URI: "Invalid URI",
	INVALID_FILE: "Invalid File",
	INVALID_RESET_PASSWORD_TOKEN: "The password reset token is invalid"
};
export const OPERATION = {
	ADD: "Creating",
	EDIT: "Updating",
	LOAD: "Loading",
	REMOVE: "Removing",
	OTHER: "other",
	UNKNOWN: "unknown",
	REGISTER: "Registering",
	VERIFICATION: "Verification",
	LOGIN: "Logging in",
	UPLOAD: "Uploading",
	DOWNLOAD: "Downloading",
	SEND: "Sending",
	RESET_PASSWORD: "Password Resetting"
};
export const ENTITY = {
	User: "the users", //register ,login ,edit ,load ,remove
	Users: "the user", //load, remove
	Pdf: "the pdf file", //load
	Csv: "the csv file", //download
	Email: "the email", // sending
	None: ""
};