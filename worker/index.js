import throng from "throng";
import {  NUM_OF_WORKERS } from "./workerConfig.js";
import { mongoURI } from "../config/dbConfig.js";
import mongoose from "mongoose";
import { MyWorker } from "./queues/myWorker.js";
// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ worker, count: NUM_OF_WORKERS, lifetime: Infinity });


function worker(id, disconnect) {
	console.log(`Started worker ${id}`);

	//make db connections
	mongoose
		.connect(mongoURI)
		.then((res) => console.log("MongoDB Connected...", res.models))
		.catch((err) => console.log("Couldn't connect to Mongodb: ", err));

	// declare/initialize/register queues
	let myWorker = new MyWorker();

	//worker shutdown
	process.once("SIGTERM", shutdown);
	process.once("SIGINT", shutdown);
	function shutdown() {
		console.log(`Worker ${id} cleanup.`);
		disconnect();
	}
}
