import { AUTH_CONFIG } from "../../config/authConfig.js";
import _ from "lodash";
import util from "util";
export class Helper {
	validateEmail = (email) => {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var tested = re.test(email.toLowerCase());
		return tested;
	};
	validatePassword = (password) => {
		var checkSmallAlphabets = new RegExp("(.*[a-z].*)");
		var checkCapitalAlphabets = new RegExp("(.*[A-Z].*)");
		var checkNumbers = new RegExp("(.*[0-9].*)");
		return password.length >= AUTH_CONFIG.PASSWORD_LENGTH && checkCapitalAlphabets.test(password) && checkSmallAlphabets.test(password) && checkNumbers.test(password);
	};

	getRandomString = (length) => Math.random().toString(20).substr(2, length);

	isEmpty = (val) => _.isEmpty(val);

	promisify = (cb) => util.promisify(cb);

	parseIfJSON = (str) => {
		try {
			var json = JSON.parse(str);
			return json;
		} catch (e) {
			return str;
		}
	};

	parseQueryParams = (query) => {
		for (const key in query) {
			query[key] = Help.parseIfJSON(query[key]);
		}
	};

	readableAmount = (amount, currency, language) => {
		if (isNaN(amount) || amount === null) {
			return "-";
		}
		return new Intl.NumberFormat(`${language}-${language.toUpperCase()}`, { style: "currency", currency: currency }).format(amount);
	};

	formatDate = (date) => {
		return `${date.getDate().toString().padStart(2, 0)}.${date.getMonth().toString().padStart(2, 0)}.${date.getFullYear()}`;
	};

}
export const Help = new Helper();
