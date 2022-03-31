import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { mongoURI } from "./config/dbConfig.js";
import mongoose from "mongoose";
import router from "./middleware/router/routes.js";
import session from "express-session";
import connectMongo from "connect-mongo";
import { requestHandler } from "./middleware/requestHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import fileUpload from "express-fileupload";
import path from "path";

const __dirname = path.resolve();
const MongoStore = connectMongo;
const app = express();
//DB connection
mongoose
	.connect(mongoURI)
	.then((res) => console.log("MongoDB Connected...", res.models))
	.catch((err) => console.log("Couldn't connect to Mongodb: ", err));
mongoose.set("returnOriginal", false);

//3rd Party Middlewares
app.use(cors());
app.use(fileUpload());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cookieParser());

//Session
app.use(
	session({
		secret: "TODO:secret",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false, maxAge: 6 * 60 * 60 * 1000 }, // 6h
		store: MongoStore.create({ mongoUrl: mongoURI }),
		userId: undefined,
	})
);

// Serve the static files from the React/Vue/Angular app
app.use(express.static(path.join(__dirname, "client/build")));

/**
 * Custom Middleware for preprocessing of the requests
 */
app.use(requestHandler);
/**
 * API Router
 */
app.use("/api", router);

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

//custom defined error handler
app.use(errorHandler);

//unhandled errors
process.on("unhandledRejection", (err) => {
	console.error("Unhandled Rejection:", err);
	//console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	//process.exit(1);
});

//creating server
const port = process.env.PORT ? process.env.PORT : 5000;
app.listen(port, () => {
	console.log(`Server Listening on ${port}`);
});
