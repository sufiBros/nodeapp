import Redis from "ioredis";
import Queue from "bull";
import { REDIS_CLIENT, REDIS_SUBSCRIBER, REDIS_URL } from "../workerConfig.js";
export class BullQueue extends Queue {
	constructor(name, options = {}) {
		options["createClient"] = (type) => {
			switch (type) {
				case "client": {
					console.log("CREATING REDIS CLIENT");
					return REDIS_CLIENT;
				}
				case "subscriber": {
					console.log("CREATING REDIS SUBSCRIBER");
					return REDIS_SUBSCRIBER;
				}
				case "bclient": {
					console.log("CREATING REDIS bclient");
					return new Redis(REDIS_URL);
				}
				default:
					throw new Error("Unexpected connection type: ", type);
			}
		};
		super(name, REDIS_URL, options);
	}
}
