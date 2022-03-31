import mongoose from "mongoose";
const Schema = mongoose.Schema;
const addressSchema = Schema({
	company: { type: String, default: "" },
	name: { type: String, default: "" },
	street: { type: String, default: "" },
	zip: { type: String, default: "" },
	city: { type: String, default: "" },
	country: { type: String, default: "" },
	phone: { type: String, default: "" },
	email: { type: String, default: "" },
	note: { type: String, default: "" },
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
