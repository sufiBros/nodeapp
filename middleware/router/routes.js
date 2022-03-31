import express from "express";
import { userRouter } from "../../api/user/userRouter.js";
import { ENTITY, ERRORS, ERROR_MESSAGES, OPERATION, ServerError } from "../errorHandler.js";
import { ssoRouter } from "../../api/sso/ssoRouter.js";

var router = express.Router({ mergeParams: true });
router.use("/user", userRouter.routes);
router.use("/sso", ssoRouter.routes);
router.all("*", (req, res) => {
	res.status(ERRORS.NOT_FOUND_404.statusCode).json(
		new ServerError(ERRORS.NOT_FOUND_404, OPERATION.OTHER, ENTITY.None, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INVALID_URI)
	);
});

export default router;
