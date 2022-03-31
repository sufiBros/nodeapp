import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError, Exception } from "../../middleware/errorHandler.js";
import User from "../user/userModel.js";
import { UserController } from "../user/userController.js";
import Encryptor from "../../common/algorithms/crypto.js";

export class SsoController {
	constructor() {}

	auth = async (userInfo, timestamp, theirHash, next) => {
		try {
			let ourHash = ()=>{ /*
				generate hash from userInfo based on mutual understanding with 2nd party
				*/return theirHash}
			let isExpired = new Date(timestamp * 1000).valueOf() < new Date().valueOf();
			if (theirHash == ourHash && !isExpired) {
				//grant access
				let user = await User.findOne({ email: userInfo.email.toLowerCase() });

				if (!user) {
					//create one
					user = new User(userInfo);
				} else {
					user.num_logins++;
				}
				let now = new Date();
				let after = new Date(now.getTime() + 3 * 60000);
				await user.save();
				let encryptor = new Encryptor("aes-256-ctr");
				let token = encryptor.encrypt(`${user.email}##${after.getTime()}`);
				return next(null, { redirect: true, url: "/sso/" + token });
			} else {
				if (isExpired) {
					throw new Exception("SSO Token Expired");
				} else {
					throw new Exception(ERROR_MESSAGES.INVALID_REQUEST_PARAMS);
				}
			}
		} catch (err) {
			UserController.destroyUserSession();
			return next(new ServerError(ERRORS.UNAUTHORIZED_401, OPERATION.UNKNOWN, ENTITY.None, ERROR_MESSAGES.UNAUTHORIZED, err.message));
		}
	};

	verify = async (token, next) => {
		try {
			if (!token) {
				throw new Error(ERROR_MESSAGES.INVALID_REQUEST_PARAMS);
			}
			let encryptor = new Encryptor("aes-256-ctr");
			let tokenParams = encryptor.decrypt(token).split("##");
			let email = tokenParams[0];
			let timestamp = parseInt(tokenParams[1]);
			let isExpired = new Date(timestamp).valueOf() < new Date().valueOf();
			if (isExpired) {
				throw new Error("SSO Token Expired");
			}
			let user = await User.findOne({ email });
		
			UserController.setUserSession(user);
			return next(null, user);
		} catch (err) {
			UserController.destroyUserSession();
			return next(new ServerError(ERRORS.UNAUTHORIZED_401, OPERATION.UNKNOWN, ENTITY.None, ERROR_MESSAGES.UNAUTHORIZED, err.message));
		}
	};
}
