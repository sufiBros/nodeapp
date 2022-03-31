import PdfPrinter from "pdfmake";
import { Obj } from "./obj.js";
import { ENTITY, ERRORS, ERROR_MESSAGES, OPERATION, ServerError } from "../../middleware/errorHandler.js";
export class Pdf extends PdfPrinter {
	docConfig = {
		defaultStyle: {
			font: "Helvetica",
			lineHeight: 1.3,
		},
		styles: {
			header: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 10],
			},
			subheader: {
				fontSize: 16,
				bold: true,
				margin: [0, 10, 0, 5],
			},
			tableHeader: {
				bold: true,
				fontSize: 13,
				color: "black",
			},
		}
	};
	constructor(customFonts = {}) {
		super(
			Obj.merge(customFonts, {
				Courier: {
					normal: "Courier",
					bold: "Courier-Bold",
					italics: "Courier-Oblique",
					bolditalics: "Courier-BoldOblique",
				},
				Helvetica: {
					normal: "Helvetica",
					bold: "Helvetica-Bold",
					italics: "Helvetica-Oblique",
					bolditalics: "Helvetica-BoldOblique",
				},
				Times: {
					normal: "Times-Roman",
					bold: "Times-Bold",
					italics: "Times-Italic",
					bolditalics: "Times-BoldItalic",
				},
				Symbol: {
					normal: "Symbol",
				},
				ZapfDingbats: {
					normal: "ZapfDingbats",
				},
			})
		);
		this.docConfig.pageMargins = [40, 50, 40, 60];
	}

	addHeader = (fn) => {
		this.docConfig["header"] = fn;
	};

	addFooter = (fn) => {
		this.docConfig["footer"] = fn;
	};

	addCoverPage = (defArr) => {
		if (Array.isArray(this.docConfig["content"])) {
			this.docConfig.content.unshift(...defArr);
		} else {
			this.docConfig["content"] = defArr;
		}
	};

	nextPage = () => {
		let content = this.docConfig["content"];
		if (content && content.length) {
			this.docConfig.content[content.length - 1]["pageBreak"] = "after";
		}
	};

	append = (content) => {
		if (this.docConfig.content && this.docConfig.content.length) {
			if (Array.isArray(content)) {
				this.docConfig.content = [...this.docConfig.content, ...content];
			} else {
				this.docConfig.content.push(content);
			}
		} else {
			this.docConfig["content"] = content;
		}
	};

	addDefaultStyle = (config) => {
		this.docConfig.addDefaultStyle = Obj.merge(this.docConfig.addDefaultStyle, config);
	};

	addCustomStyle = () => {
		//TODO
	};

	createPdf = (next) => {
		try {
			let doc = this.createPdfKitDocument(this.docConfig);
			let chunks = [];

			doc.on("data", (chunk) => {
				chunks.push(chunk);
			});

			doc.on("end", () => {
				const result = Buffer.concat(chunks);
				next(null, result); //"data:application/pdf;base64," + result.toString("base64"));
			});

			doc.end();
		} catch (err) {
			next(new ServerError(ERRORS.INTERNAL_SERVER_ERROR_500, OPERATION.LOAD, ENTITY.Pdf, ERROR_MESSAGES.AUTO, err.message ? err.message : err));
		}
	};
}

export class PdfHelper extends Pdf {
	
	constructor(data,customFonts = {}) {
		this.data = data;
		super(customFonts);
		
	}
	addBasicHeaderAndFooter = () => {
		this.addHeader((currentPage, pageCount, pageSize) => {
			let def = [
				{
					columns: [
						{ text: [`Title`, { text: `${this.data.title}`, bold: true }], margin: [20, 20, 20, 0] },
						{ text: `Date: ${new Date().toLocaleDateString()}`, alignment: "right", margin: [20, 20, 20, 0] },
					],
					fontSize: 9,
				},
				{
					canvas: [{ type: "line", x1: 20, y1: 5, x2: pageSize.width - 20, y2: 5, lineWidth: 1 }],
					paddingBottom: 10,
				},
			];
			return def;
		});
		this.addFooter((currentPage, pageCount, pageSize) => {
			return {
				columns: [{ text: "" }, { text: `${currentPage.toString()} / ${pageCount}`, alignment: "right" }],
				margin: [0, 20, 20, 0],
				fontSize: 9,
			};
		});
	};

	/**
	 * You can overload here the following base class functions
	 * 
	 * append
	 * appendCoverPage
	 */
}
