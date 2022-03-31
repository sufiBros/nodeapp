import { Helper } from "./helper.js";
import _ from "lodash";
class StringHelper extends Helper {
	constructor() {
		super();
	}

	escapeRegExp = (string) => {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
	};
	replaceAll = (str, match, replacement) => {
		return str.replace(new RegExp(this.escapeRegExp(match), "g"), () => replacement);
	};
}
export const Str = new StringHelper();
