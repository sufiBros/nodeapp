var dbUri = "";
if (process.env.NODE_ENV === "production") {
	dbUri = process.env.MONGO_URI;
} else {
	dbUri = "mongodb://localhost:27020/development";
}
export const mongoURI = dbUri;
