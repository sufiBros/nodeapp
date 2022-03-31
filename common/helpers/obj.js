import _ from "lodash";
import { Helper } from "./helper.js";

class ObjectHelper extends Helper {
	constructor() {
		super();
	}
	/**
	 * Object specific operations
	 */
	deepCopy = (obj) => _.cloneDeep(obj);

	filterKeys = (obj, keys) => {
		Object.keys(obj).forEach(function (key) {
			if (keys.indexOf(key) == -1) {
				delete obj[key];
			}
		});
		return obj;
	};

	removeKeys = (obj, keys) => _.omit(obj, keys);

	/**
	 * Object MAY have ONLY keys specified in keys
	 */
	hasAnyOtherKey = (obj, keys) => {
		let objKeys = Object.keys(obj);
		if (!objKeys.length) {
			return false;
		}
		return objKeys.some((k) => !keys.includes(k));
	};

	/**
	 * Object must ATLEAST have the specified keys
	 */
	hasKeys = (obj, keys) => {
		let objKeys = Object.keys(obj);
		return keys.every((k) => objKeys.includes(k));
	};
	/**
	 * Object must ONLY have the specified keys
	 */
	hasOnlyKeys = (obj, keys) => {
		let objKeys = Object.keys(obj);
		if (objKeys.length !== keys.length) {
			return false;
		}
		return this.hasKeys(obj, keys);
	};

	isObject = (obj) => !!(typeof obj === "object" && obj !== null);

	merge = (obj1, obj2) => _.merge(obj1, obj2);
}
export const Obj = new ObjectHelper();
