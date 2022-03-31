import { ERRORS, ERROR_MESSAGES, ENTITY, OPERATION, ServerError } from "../middleware/errorHandler.js";
import { Help } from "./helpers/helper.js";
import nodemailer from "nodemailer";
export class Email {
	to = "";
	from = "";
	subject = "";
	text = "";
	html = "";
	constructor(to, from, subject, text, html) {
		this.to = to;
		this.from = from;
		this.subject = subject;
		this.text = text ? text : "";
		this.html = html ? html : "";
	}
}

export class EmailHandler {
	constructor(params = {
		host: "smtp.office365.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.SMTP_USERNAME || "custom@custom.com",
			pass: process.env.SMTP_PASSWORD || "TODOpassword",
		},
		requireTLS: true,
		tls: {
			rejectUnauthorized: false,
		},
	}) {
		
		this.transporter = nodemailer.createTransport(params);
	}

	send(email) {
		return new Promise((resolve, reject) => {
			let toValidated = false;
			//if multiple receivers
			if (typeof email.to !== "string" && email.to.length) {
				let v = email.to.map((e) => Help.validateEmail(e));
				toValidated = !v.includes(false);
			} else {
				toValidated = Help.validateEmail(email.to);
			}
			if (!email || !toValidated || !Help.validateEmail(email.from)) {
				return reject(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.SEND, ENTITY.Email, ERROR_MESSAGES.AUTO, ERROR_MESSAGES.INVALID_EMAIL_SENDER_RECEIVER));
			}
			if (!email.subject) {
				return reject(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.SEND, ENTITY.Email, ERROR_MESSAGES.AUTO, ERROR_MESSAGES.EMAIL_SUBJECT_UNDEFINED));
			}
			this.transporter
				.sendMail(email)
				.then(() => {
					console.log("Email sent to ", email.to, " from ", email.from);
					resolve();
				})
				.catch((err) => {
					reject(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.SEND, ENTITY.Email, err.userMessage, err.message));
				});
		});
	}
}
