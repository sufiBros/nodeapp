import express from "express";
import { queryHandler } from "../responseHandler.js";
export class ApiRouter {
	routes = express.Router({ mergeParams: true });
	constructor(routerConfig) {
		Object.keys(routerConfig).forEach((key) => {
			let route = routerConfig[key];

			//registering route
			this.routes[route.method.toLowerCase()](route.path, route.auth, queryHandler(route.controllerFunction, route.params));
			// equivalent to: routes.get("/path",()=>{auth function}, ()=>{api function})
		});
	}
}
