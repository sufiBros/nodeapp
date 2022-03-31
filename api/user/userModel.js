import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcrypt";
import Address from "../../common/models/addressModel.js";
import { Help } from "../../common/helpers/helper.js";
import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError } from "../../middleware/errorHandler.js";
import { AUTH_CONFIG } from "../../config/authConfig.js";

export const userSchema = Schema(
	{
		firstname: {
			type: String,
			maxlength: 50,
		},
		lastname: {
			type: String,
			maxlength: 50,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			validate: [Help.validateEmail, ERROR_MESSAGES.INVALID_EMAIL],
		},
		password: {
			type: String,
			required: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		verify_id: {
			type: String,
		},
		num_logins: {
			type: Number,
			default: 1,
		},
		client_id: String,
		reset_password_token: String,
		role: String,
		current_address: Address.schema,
		default_address: Address.schema,
	},
	{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
userSchema.pre("save", function (next) {
	var user = this;
	user.email = user.email.toLowerCase();
	if (user.isModified("password")) {
		if (!Help.validatePassword(user.password)) {
			return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.EDIT, ENTITY.User, ERROR_MESSAGES.INVALID_PASSWORD, ERROR_MESSAGES.INVALID_PASSWORD));
		}
		bcrypt.hash(user.password + AUTH_CONFIG.SECRET_JWT, AUTH_CONFIG.SALT_ROUNDS, (err, hash) => {
			if (err) return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.UNKNOWN, ENTITY.User, err.userMessage, err.message));
			user.password = hash;
			// TODO send email notification for password update
			next();
		});
	} else {
		next();
	}
});

userSchema.pre("remove", async function (next) {
	try {
		let doc = this;
	/**
	 * remove user dependent information
	 */
		return next(null, doc);
	} catch (err) {
		return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.REMOVE, ENTITY.User, ERROR_MESSAGES.AUTO, err.message));
	}
});

userSchema.methods.comparePassword = function (plainPassword, next) {
	bcrypt.compare(plainPassword + AUTH_CONFIG.SECRET_JWT, this.password, function (err, isMatch) {
		next(err, isMatch);
	});
};
const User = mongoose.model("User", userSchema);
export default User;
