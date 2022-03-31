import { AUTH } from "../../middleware/auth.js";
import { ApiRouter } from "../../middleware/router/apiRouter.js";
import { SsoController } from "./ssoController.js";
let ssoController = new SsoController();

export const ssoRouter = new ApiRouter({
	/**
	 * for 2nd party
	 */
	auth: {
		method: "POST",
		path: "/auth",
		params: [
			{ name: "userInfo", type: "body", required: true },
			{ name: "timestamp", type: "body", required: true },
			{ name: "hash", type: "body", required: true },
		],
		auth: AUTH.ensureNone,
		controllerFunction: ssoController.auth,
	},
	/**
	 * for frontend app
	 */
	verify: {
		method: "GET",
		path: "/verify/:token",
		params: [{ name: "token", type: "url", required: true }],
		auth: AUTH.ensureNone,
		controllerFunction: ssoController.verify,
	},
});
