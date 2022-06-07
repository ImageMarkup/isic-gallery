import ajaxActions from "../ajaxActions";

const PromiseFileReader = require("promise-file-reader");

class RegisterMetadataaService {
	constructor(view, datasetInfoTemplate, form, uploader, uploaderTempalte, submitButton, removeFileButton) {
		this._view = view;
		this._datasetInfoTemplate = datasetInfoTemplate;
		this._form = form;
		this._uploader = uploader;
		this._uploaderTemplate = uploaderTempalte;
		this._submitButton = submitButton;
		this._removeFileButton = removeFileButton;
		this._init();
	}

	_init() {
		webix.extend(this._view, webix.ProgressBar);
		this._uploader.attachEvent("onBeforeFileAdd", (file) => {
			if (this._uploader.files.count() !== 0 || file.type !== "csv") {
				webix.alert({type: "alert-warning", text: "You can upload only one CSV file"});
				return false;
			}
			this._uploader.filename = file.name;
			return true;
		});

		this._uploader.attachEvent("onFileUploadError", (item, response) => {
			webix.message({type: "error", text: "Uploading error"});
		});

		this._uploader.attachEvent("onAfterFileAdd", () => {
			this._removeFileButton.enable();
		});

		this._removeFileButton.attachEvent("onItemClick", () => {
			this._uploader.files.clearAll(); // remove all files from uploader
			this._removeFileButton.disable();
		});


		this._submitButton.attachEvent("onItemClick", () => {
			const datasetValues = this._datasetInfoTemplate.getValues();
			const fileName = this._uploader.filename;
			if (!this._uploader.files.count()) {
					webix.alert(
						{
							type: "alert-warning",
							text: "There is no file for uploading. <br>Please, add CSV file.</br>"
						});
					return;
			}

			this._uploader.files.find((obj) => {
				const item = this._uploader.files.getItem(obj.id);
				this._view.showProgress();
				PromiseFileReader.readAsText(item.file)
					.then((fileData) => {
					})
					.catch((error) => {
						this._removeFileButton.callEvent("onItemClick");
						const errorObject = JSON.parse(error);
						webix.message(errorObject.message);
						this._uploader.files.clearAll();
						this._view.hideProgress();
					});
			});
		});
	}

	load(datasetId) {
	}
}

export default RegisterMetadataaService;
