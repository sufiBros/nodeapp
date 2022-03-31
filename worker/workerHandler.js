import JobController from "../common/controllers/jobController.js";

export default class WorkerHandler {
	jobLogger = new JobController();
	constructor() {}

	log = (process) => {
		let self = this;
		process.on("error", function (error) {
			// An error occured.
			console.error(error);
		});

		process.on("waiting", function (jobId) {
			// A Job is waiting to be processed as soon as a worker is idling.
			console.log(`Job --id: ${jobId}-- is waiting to be processed as soon as a worker is idling.`, jobId);
		});

		process.on("active", function (job, jobPromise) {
			// A job has started. You can use `jobPromise.cancel()`` to abort it.
			console.log(`Job --id: ${job.id}-- has started.`);
		});

		process.on("stalled", async function (job) {
			// A job has been marked as stalled. This is useful for debugging job
			// workers that crash or pause the event loop.

			console.log(`Job --id: ${job.id}-- has been marked as stalled. This is useful for debugging job workers that crash or pause the event loop: `);
			let jl = await self.jobLogger.add(job, "stalled", "");
		});

		process.on("progress", function (job, progress) {
			// A job's progress was updated!
			console.log(`Job's --id: ${job.id}-- progress was updated!: `, progress);
		});

		process.on("completed", async function (job, result) {
			// A job successfully completed with a `result`.

			console.log(`Job --id: ${job.id}-- successfully completed with a 'result' length: `, result?.length);
			let jl = await self.jobLogger.add(job, "completed", "");
		});

		process.on("failed", async function (job, err) {
			// A job failed with reason `err`!
			console.log(`Job --id: ${job.id}-- failed with reason: `, err);
			let jl = await self.jobLogger.add(job, "failed", err);
		});

		process.on("paused", function () {
			// The queue has been paused.
			console.log("The queue has been paused.");
		});

		process.on("resumed", function (job) {
			// The queue has been resumed.
			console.log("The queue has been resumed with job: ", job.id);
		});

		process.on("cleaned", function (jobs, type) {
			// Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
			// jobs, and `type` is the type of jobs cleaned.
			console.log(`Old jobs have been cleaned from the queue. ${jobs} are cleaned from processor ${type}`);
		});

		process.on("drained", function () {
			// Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
			console.log("Jobs processed!");
		});

		process.on("removed", function (job) {
			// A job successfully removed.
			console.log(`Job --id: ${job.id}-- successfully removed`);
		});
	};
}
