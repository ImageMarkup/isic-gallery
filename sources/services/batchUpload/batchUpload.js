// import AWS from "aws-sdk";
// import ajaxActions from "../ajaxActions";
// import createDatasetModel from "../../models/createDatasetModel";
// import constants from "../../constants";

class BatchUploadService {
	constructor(view, form, uploader, buttonDeleteFile, datasetInfoPanel) {
		this._view = view;
		this._form = form;
		this._uploader = uploader;
		this._buttonDeleteFiles = buttonDeleteFile;
		this._datasetInfoPanel = datasetInfoPanel;
		this._init();
	}

	_init() {
		this._descriptionTemplate = this._view.$scope.getDescriptionTemplate();
		webix.extend(this._view, webix.ProgressBar);

		this._form.elements.dataset.attachEvent("onChange", (newv) => {
			const dataset = this._form.elements.dataset.getList().getItem(newv);
			this._form.setValues(dataset, true);
			this._descriptionTemplate.setValues(dataset.description);
			this._datasetInfoPanel.show();
		});

		this._uploader.attachEvent("onBeforeFileAdd", (file) => {
			if (this._uploader.files.count() !== 0 || file.type !== "zip") {
				webix.alert({type: "alert-warning", text: "You can upload only one zip archive"});
				return false;
			}
			this._uploader.filename = file.name;
			return true;
		});

		this._uploader.attachEvent("onAfterFileAdd", () => {
			this._buttonDeleteFiles.enable();
		});

		this._uploader.attachEvent("onFileUploadError", (/* item, response */) => {
			webix.message({type: "error", text: "Uploading error"});
		});

		this._buttonDeleteFiles.attachEvent("onItemClick", () => {
			this._uploader.files.clearAll(); // remove all files from uploader
			this._buttonDeleteFiles.disable();
		});

		this._form.elements.submit.attachEvent("onItemClick", () => {
			// TODO: uncomment when collections endpoint will be implemented
			// const values = this._form.getValues();
			if (!this._uploader.files.count()) {
				webix.alert(
					{
						type: "alert-warning",
						text: "There is no file for uploading. Please, add zip archive"
					}
				);
				return;
			}
			if (this._form.validate()) {
				// TODO: implement when collection endpoint will be implemented
			}
		});
	}
}

export default BatchUploadService;
