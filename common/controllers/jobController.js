import BaseController from "./baseController.js";
import Job from "../models/job.js";
export default class JobController extends BaseController {
	constructor() {
		super(Job);
	}

	add = (job, status, errorMessage) => {
		return new Promise(async (resolve, reject) => {
			try {
				let jobLog = new Job({
					job_id: job.id,
					job_name: job.name,
					job_status: status,
					processed_at: new Date(), //new Date(job.processedOn * 1000),
					finished_at: new Date(), //new Date(job.finishedOn * 1000),
					error_message: errorMessage,
					queue_name: job.queue.name,
					queue_token: job.queue.token,
				});
				resolve(await jobLog.save());
			} catch (err) {
				reject(err);
			}
		});
	};
}
