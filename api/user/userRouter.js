import { ApiRouter } from "../../middleware/router/apiRouter.js";
import { AUTH } from "../../middleware/auth.js";
import { UserController } from "./userController.js";

let userController = new UserController();
export const userRouter = new ApiRouter({
	fetch: {
		method: "GET",
		path: "/fetch",
		params: [
			{ name: "filter", type: "query", required: false },
			{ name: "select", type: "query", required: false },
			{ name: "options", type: "query", required: false },
		],
		auth: AUTH.ensureOne(AUTH.isAdmin),
		controllerFunction: userController.fetch,
	},
	getById: {
		method: "GET",
		path: "/getById/:id",
		params: [
			{ name: "id", type: "url", required: true },
			{ name: "select", type: "query", required: false },
			{ name: "options", type: "query", required: false },
		],
		auth: AUTH.ensureAny([AUTH.isUserHimself, AUTH.isAdmin]),
		controllerFunction: userController.getById,
	},
	register: {
		method: "POST",
		path: "/register",
		params: [{ name: "data", type: "body", required: true }],
		auth: AUTH.ensureNone,
		controllerFunction: userController.register,
	},
	verify: {
		method: "GET",
		path: "/verify/:email/:verify_id",
		params: [
			{ name: "email", type: "url", required: true },
			{ name: "verify_id", type: "url", required: true },
		],
		auth: AUTH.ensureNone,
		controllerFunction: userController.verify,
	},
	login: {
		method: "POST",
		path: "/login",
		params: [{ name: "data", type: "body", required: true }],
		auth: AUTH.ensureNone,
		controllerFunction: userController.login,
	},
	logout: {
		method: "GET",
		path: "/logout",
		params: [],
		auth: AUTH.ensureOne(AUTH.isUser),
		controllerFunction: userController.logout,
	},
	deactivate: {
		method: "PUT",
		path: "/deactivate",
		params: [{ name: "id", type: "url", required: true }],
		auth: AUTH.ensureOne(AUTH.isAdmin),
		controllerFunction: userController.deactivate,
	},
	removeById: {
		method: "DELETE",
		path: "/removeById/:id",
		params: [{ name: "id", type: "url", required: true }],
		auth: AUTH.ensureAny([AUTH.isUserHimself, AUTH.isAdmin]),
		controllerFunction: userController.removeById,
	},
	resetPassword: {
		method: "GET",
		path: "/resetPassword/:email",
		params: [{ name: "email", type: "url", required: true }],
		auth: AUTH.ensureNone,
		controllerFunction: userController.resetPassword,
	},
	verifyResetPasswordToken: {
		method: "GET",
		path: "/verifyResetPasswordToken/:email/:token",
		params: [
			{ name: "email", type: "url", required: true },
			{ name: "token", type: "url", required: true },
		],
		auth: AUTH.ensureNone,
		controllerFunction: userController.verifyResetPasswordToken,
	},
	updatePassword: {
		method: "PUT",
		path: "/updatePassword",
		params: [
			{ name: "email", type: "body", required: true },
			{ name: "password", type: "body", required: true },
			{ name: "token", type: "body", required: true },
		],
		auth: AUTH.ensureNone,
		controllerFunction: userController.updatePassword,
	},
	update: {
		method: "PUT",
		path: "/update/:id",
		params: [
			{ name: "id", type: "url", required: true },
			{ name: "data", type: "body", required: true },
		],
		auth: AUTH.ensureAny([AUTH.isUserHimself, AUTH.isAdmin]),
		controllerFunction: userController.edit,
	},
	changePassword: {
		method: "PUT",
		path: "/changePassword/:userId",
		params: [
			{ name: "userId", type: "url", required: true },
			{ name: "oldPassword", type: "body", required: true },
			{ name: "newPassword", type: "body", required: true },
		],
		auth: AUTH.ensureOne(AUTH.isUserHimself),
		controllerFunction: userController.changePassword,
	},
});
