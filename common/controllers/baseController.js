import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError } from "../../middleware/errorHandler.js";
import { Obj } from "../helpers/obj.js";

export default class BaseController {
	static request = undefined;
	static response = undefined;

	model = undefined;
	constructor(model) {
		if (!model) {
			throw new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.UNKNOWN, ENTITY.None, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, "Model is 'undefined' in BaseController");
		}
		this.model = model;
	}
	fetch = (filter, select, options, next) => {
		this.model.find(filter ? filter : {}, select ? select : {}, options ? options : {}, (err, result) => {
			if (err) {
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOAD, ENTITY[this.model.modelName + "s"], err.userMessage, err.message));
			}
			next(null, result);
		});
	};

	getOne = (filter, select, options, next) => {
		this.model.findOne(filter ? filter : {}, select ? select : {}, options ? options : {}, (err, result) => {
			if (err) {
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOAD, ENTITY[this.model.modelName], err.userMessage, err.message));
			}
			if (!result) {
				return next(new ServerError(ERRORS.NOT_FOUND_404, OPERATION.LOAD, ENTITY[this.model.modelName], ERROR_MESSAGES.AUTO, ERROR_MESSAGES.ENTITY_NOT_FOUND));
			}
			return next(null, result);
		});
	};

	getById = (id, select, options, next) => {
		if (!id) {
			return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.LOAD, ENTITY[this.model.modelName], ERROR_MESSAGES.AUTO, ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
		}
		this.model.findById(id, select ? select : {}, options ? options : {}, (err, result) => {
			if (err) {
				return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOAD, ENTITY[this.model.modelName], err.userMessage, err.message));
			}
			if (!result) {
				return next(new ServerError(ERRORS.NOT_FOUND_404, OPERATION.LOAD, ENTITY[this.model.modelName], ERROR_MESSAGES.AUTO, ERROR_MESSAGES.ENTITY_NOT_FOUND));
			}
			return next(null, result);
		});
	};

	add = async (data, next) => {
		try {
			data = await this.validateRequestData(data);
			let result = await this.model.create(data);
			if (!result) {
				throw new Error("An unknown error occured while creating '", this.model.modelName, "'");
			}
			return next(null, result);
		} catch (err) {
			return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.ADD, ENTITY[this.model.modelName], err.userMessage, err.message));
		}
	};

	edit = async (id, data, next) => {
		try {
			if (!id) {
				return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.EDIT, ENTITY[this.model.modelName], ERROR_MESSAGES.AUTO, ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
			}
			data = await this.validateRequestData(data, id);
			let instance = await this.model.findById(id);
			if (!instance) {
				throw new Error(ERROR_MESSAGES.ENTITY_NOT_FOUND);
			}
			/**
			 * the purpose of not using Model.update or Model.findByIdAndUpdate is that,
			 * one of them doesnt triggers pre/post save model hooks, and one of them doesnt
			 * return the updated instance.
			 */
			instance = Object.assign(instance, data);
			await instance.save();
			return next(null, instance);
		} catch (err) {
			return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.EDIT, ENTITY[this.model.modelName], err.userMessage, err.message));
		}
	};

	removeById = async (id, next) => {
		try {
			if (!id) {
				return next(new ServerError(ERRORS.BAD_REQUEST_400, OPERATION.REMOVE, ENTITY[this.model.modelName], ERROR_MESSAGES.AUTO, ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
			}
			let instance = await this.model.findById(id);
			if (!instance) {
				throw new Error(ERROR_MESSAGES.ENTITY_NOT_FOUND);
			}
			await instance.remove();
			return next(null, instance);
		} catch (err) {
			return next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.REMOVE, ENTITY[this.model.modelName], err.userMessage, err.message));
		}
	};

	/**
	 *
	 * @param {'data' from request body} data
	 * @param {id of Model instance in case of 'edit/updte' otherwise 'add'} id
	 * @description {This method is a basic verification of request data.
	 * This should be overriden in extended controllers to validate data according to their workflow
	 * }
	 */
	validateRequestData = (data, id = "add") => {
		return new Promise((resolve, reject) => {
			if (!data || !Obj.isObject(data) || !id) {
				reject(new Error(ERROR_MESSAGES.INVALID_REQUEST_PARAMS));
			}
			resolve(data);
		});
	};
}
