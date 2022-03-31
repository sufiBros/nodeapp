import BaseController from "../../common/controllers/baseController.js";
import User from "./userModel.js";
import { EMAIL_CONFIG } from "../../config/emailConfig.js";
import { Email, EmailHandler } from "../../common/emailHandler.js";
import { ERRORS, ERROR_MESSAGES, OPERATION, ENTITY, ServerError, Exception } from "../../middleware/errorHandler.js";
import { Help } from "../../common/helpers/helper.js";
import Address from "../../common/models/addressModel.js";
export class UserController extends BaseController {
	constructor() {
		super(User);
	}

	

	validateRequestData = (data, id) => {
		return new Promise((resolve, reject) => {
			try {
				if (!id) {
					throw new Error(ERROR_MESSAGES.INVALID_REQUEST_PARAMS);
				}
				if (data.password || data.email || data.verified || data.verify_id || data.reset_password_token) {
					throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
				}
				resolve(data);
			} catch (err) {
				reject(err);
			}
		});
	};

	register = async (data, next) => {
		try {
			if (!data || !data.email || !data.password) {
				throw new Error(ERROR_MESSAGES.INVALID_REQUEST_PARAMS);
			}
			let user = await User.findOne({ email: data.email});
			if (user && user.verified) {
				throw new Exception(ERROR_MESSAGES.USER_EXIST);
			}
			if (!user) {
				user = new User(data);
				user.role = "user";
				user.default_address = new Address(data.address);
			}
			user.verify_id = Help.getRandomString(8);
			await user.save();
            let welcomeEmail = new Email(
				user.email,
				EMAIL_CONFIG.NO_REPLY,
				EMAIL_CONFIG.WELCOME_SUBJECT,
				"",
				`<p>${EMAIL_CONFIG.WELCOME_BODY}<br\><br\>${BaseController.request.host}/verify/${user.email}/${user.verify_id}<p>`
			);
			let emailHandler = new EmailHandler();
			await emailHandler.send(welcomeEmail);
			next(null, user);
		} catch (err) {
			return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.REGISTER, ENTITY.User, err.userMessage, err.message));
		}
	};

	verify = (email, verify_id, next) => {
		if (!email || !verify_id) {
			return next(
				new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.VERIFICATION, ENTITY.User, ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN, ERROR_MESSAGES.INVALID_REQUEST_PARAMS)
			);
		}
		this.getOne({ email, verify_id }, (err, user) => {
			if (err) {
				return next(new ServerError(ERRORS.NOT_FOUND_404, OPERATION.VERIFICATION, ENTITY.User, ERROR_MESSAGES.AUTO, err.message));
			}
			if (!user) {
				return next(
					new ServerError(ERRORS.NOT_FOUND_404, OPERATION.VERIFICATION, ENTITY.User, ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN, ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN)
				);
			}
			/*changing verify_id so that it would be valid only once*/
			user.verify_id = Help.getRandomString(8);
			user.verified = true;
			UserController.setUserSession(user);
			try {
				user.save();
			} catch (err) {
				user.verified = false;
				UserController.destroyUserSession();
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.VERIFICATION, ENTITY.User, err.userMessage, err.message));
			}
			next(null, user);
		});
	};

	login = (data, next) => {
		if (!data || !data.email) {
			return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.LOGIN, ENTITY.User, ERROR_MESSAGES.USER_NOT_FOUND, ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
		}
		this.model.findOne(
			{
				email: data.email.toLowerCase(),
			},
			(err, user) => {
				if (err) {
					next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOGIN, ENTITY.User, err.userMessage, err.message));
				}
				if (!user) {
					return next(new ServerError(ERRORS.NOT_FOUND_404, OPERATION.LOGIN, ENTITY.User, ERROR_MESSAGES.USER_NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
				}
				if (!user.verified) {
					return next(new ServerError(ERRORS.METHOD_NOT_ALLOWED_405, OPERATION.LOGIN, ENTITY.User, ERROR_MESSAGES.USER_NOT_VERIFIED, ERROR_MESSAGES.USER_NOT_VERIFIED));
				}
					user.comparePassword(data.password, async (err, isMatch) => {
						if (err) {
							return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOGIN, ENTITY.User, err.userMessage, err.message));
						}
						if (!isMatch) {
							return next(
								new ServerError(
									ERRORS.UNAUTHORIZED_401,
									OPERATION.LOGIN,
									ENTITY.User,
									ERROR_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT,
									ERROR_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT
								)
							);
						}
						UserController.setUserSession(user);
						user.num_logins += 1;
						await user.save();
						return next(null, user);
					});
				}
			
		);
	};

	logout = (next) => {
		UserController.destroyUserSession();
		next(null, "logged out!");
	};

	deactivate = (id, next) => {
		return this.edit(id, { verified: false }, {}, next);
	};

	resetPassword = (email, next) => {
		if (!email) {
			return new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.RESET_PASSWORD, ENTITY.User, ERROR_MESSAGES.USER_NOT_FOUND, ERROR_MESSAGES.INVALID_REQUEST_PARAMS);
		}
		User.findOne({ email }, (err, user) => {
			if (err) {
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
			}
			if (!user) {
				return next(new ServerError(ERRORS.NOT_FOUND_404, OPERATION.RESET_PASSWORD, ENTITY.User, ERROR_MESSAGES.USER_NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
			}
			user.reset_password_token = Help.getRandomString(8);
			let session = BaseController.request.session;
			let resetPasswordEmail = undefined;
			var isLocalhost = BaseController.request.get("host").indexOf("localhost") == 0;
			var currentHost = isLocalhost ? BaseController.request.get("host").replace("5000", "3000") : BaseController.request.get("host");
			resetPasswordEmail = new Email(
				user.email,
				EMAIL_CONFIG.NO_REPLY,
				EMAIL_CONFIG.PASSWORD_RESET_SUBJECT,
				"",
				`<p>${EMAIL_CONFIG.PASSWORD_RESET_BODY}<br />${BaseController.request.host}/resetPassword/${user.email}/${user.reset_password_token}<p>`
			);
			let emailHandler = new EmailHandler();
			emailHandler
				.send(resetPasswordEmail)
				.then((succ) => {
					user.save((err, user) => {
						if (err) {
							return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
						}
						return next(null, "Please check your email to reset your password.");
					});
				})
				.catch((err) => {
					return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.SEND, ENTITY.Email, err.userMessage, err.message));
				});
		});
	};

	verifyResetPasswordToken = (email, reset_password_token, next) => {
		User.findOne({ email, reset_password_token }, (err, user) => {
			if (err) {
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
			}
			if (!user) {
				return next(
					new ServerError(
						ERRORS.NOT_FOUND_404,
						OPERATION.RESET_PASSWORD,
						ENTITY.User,
						ERROR_MESSAGES.INVALID_RESET_PASSWORD_TOKEN,
						ERROR_MESSAGES.INVALID_RESET_PASSWORD_TOKEN
					)
				);
			}
			user.save((err, user) => {
				if (err) {
					return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
				}
				return next(null, email);
			});
		});
	};

	updatePassword = (email, password, reset_password_token, next) => {
		if (!password) {
			return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.RESET_PASSWORD, ENTITY.User, ERROR_MESSAGES.INVALID_PASSWORD, ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
		}
		User.findOne({ email, reset_password_token }, (err, user) => {
			if (err) {
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
			}
			if (!user) {
				return next(
					new ServerError(
						ERRORS.UNAUTHORIZED_401,
						OPERATION.RESET_PASSWORD,
						ENTITY.User,
						ERROR_MESSAGES.INVALID_RESET_PASSWORD_TOKEN,
						ERROR_MESSAGES.INVALID_RESET_PASSWORD_TOKEN
					)
				);
			}
			user.reset_password_token = Help.getRandomString(8); //changing token so that reset link would become invalid
			UserController.setUserSession(user);
			user.password = password;
			user.num_logins += 1;
			user.save(async (err, user) => {
				if (err) {
					return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
				}
				return next(null, user);
			});
		});
	};

	changePassword = (userId, oldPassword, newPassword, next) => {
		this.model.findOne(
			{
				_id: userId
			},
			(err, user) => {
				if (err) {
					return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
				}
				if (!user) {
					return next(new ServerError(ERRORS.UNAUTHORIZED_401, OPERATION.LOAD, ENTITY.User, ERROR_MESSAGES.USER_NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND));
				}
				user.comparePassword(oldPassword, async (err, isMatch) => {
					if (err) {
						return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
					}
					if (!isMatch) {
						return next(
							new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOGIN, ENTITY.User, ERROR_MESSAGES.INCORRECT_PASSWORD, ERROR_MESSAGES.INCORRECT_PASSWORD)
						);
					} else {
						user.password = newPassword;
						user.save()
							.then((succ) => {
								UserController.destroyUserSession();
								return next(null, "Please Login again with your new password.");
							})
							.catch((err) => {
								return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.RESET_PASSWORD, ENTITY.User, err.userMessage, err.message));
							});
					}
				});
			}
		);
	};

	static setUserSession(user) {
		BaseController.request.session["userId"] = user._id.toString();
		BaseController.request.session["userRole"] = user.role;
		BaseController.response.cookie("userRole", BaseController.request.session.userRole);
		BaseController.response.cookie("userId", BaseController.request.session.userId);
	}

	static destroyUserSession() {
		BaseController.request.session["userId"] = undefined;
		BaseController.request.session["userRole"] = undefined;
	}
}
