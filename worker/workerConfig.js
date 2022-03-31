import Redis from "ioredis";
export const NUM_OF_WORKERS = process.env.WEB_CONCURRENCY ? process.env.WEB_CONCURRENCY : 2;
export const MAX_JOBS_PER_WORKER = 50;
export const REDIS_URL = process.env.REDIS_URL ? process.env.REDIS_URL : "redis://127.0.0.1:6379";
export const REDIS_CLIENT = new Redis(REDIS_URL);
export const REDIS_SUBSCRIBER = new Redis(REDIS_URL);
