
export const job1 = async (params, next) => {
	try {
		let result = null;
		/**
		 * do work here
		 */
		next(null, result);
	} catch (err) {
		console.log("ERROR in 'JOB1': ", err);
		next(err);
	}
};