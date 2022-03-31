import { Helper } from "./helper.js";
import _ from "lodash";
class ArrayHelper extends Helper {
	constructor() {
		super();
	}

/**
 * Array specific operations
 */
	unique = (arr) => _.uniq(arr);

	compact = (arr) => _.compact(arr);

	groupBy = (arr, key) => _.groupBy(arr, key);
}
export const Arr = new ArrayHelper();
