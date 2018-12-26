import ajaxActions from "../ajaxActions";

const PromiseFileReader = require("promise-file-reader");

class RegisterMetadataaService {
	constructor(view, datasetInfoTemplate, form, uploader, uploaderTempalte, submitButton) {
		this._view = view;
		this._datasetInfoTemplate = datasetInfoTemplate;
		this._form = form;
		this._uploader = uploader;
		this._uploaderTemplate = uploaderTempalte;
		this._submitButton = submitButton;
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
				let item = this._uploader.files.getItem(obj.id);
				this._view.showProgress();
				PromiseFileReader.readAsText(item.file)
					.then((fileData) => {
						ajaxActions.postRegisterMetadata(datasetValues._id, fileName, fileData)
							.then(() => {
								webix.message("Metadata was successfully registered!");
								this._uploader.files.clearAll();
								this._view.hideProgress();
							})
							.fail(() => {
								webix.message("Something went wrong!");
								this._uploader.files.clearAll();
								this._view.hideProgress();
							});
					})
					.catch((error) => {
						let errorObject = JSON.parse(error);
						webix.message(errorObject.message);
						this._uploader.files.clearAll();
						this._view.hideProgress();
					});
			});
		});
	}

	load(datasetId) {
		ajaxActions.getDatasetItem(datasetId).then((data) => {
			this._datasetInfoTemplate.setValues(data);
		});
	}
}

export default RegisterMetadataaService;
