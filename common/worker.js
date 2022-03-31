import Queue from "bull";
import { REDIS_URL } from "../worker/workerConfig.js";
export const myWorker = new Queue("MyWorker", REDIS_URL);
