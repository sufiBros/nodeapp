import { BullQueue } from "./bullQueue.js";
import { MAX_JOBS_PER_WORKER } from "../workerConfig.js";
import WorkerHandler from "../workerHandler.js";
export class MyWorker extends BullQueue {
	constructor() {
		super("MyWorker");
		super.process("job1", MAX_JOBS_PER_WORKER, job1);
		let handler = new WorkerHandler();
		handler.log(this);
	}
}
