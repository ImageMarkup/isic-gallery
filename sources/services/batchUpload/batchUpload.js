import ajaxActions from "../ajaxActions";
import state from "../../models/state";
import authService from "../auth";

let AWS = require('aws-sdk');

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
		webix.extend(this._view, webix.ProgressBar);

		ajaxActions.getDataset({detail: true}).then((data) => {
			if (data && data.map) {
				const preparedData = data.map((item) => {
					const newItem = webix.copy(item);
					newItem.id = item._id;
					return newItem;
				});
				this._form.elements.dataset.getList().parse(preparedData);
			}
		});

		this._form.elements.dataset.attachEvent("onChange", (newv) => {
			const dataset = this._form.elements.dataset.getList().getItem(newv);
			this._form.setValues(dataset, true);
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

		this._uploader.attachEvent("onFileUploadError", (item, response) => {
			webix.message({type: "error", text: "Uploading error"});
		});

		this._buttonDeleteFiles.attachEvent("onItemClick", () => {
			this._uploader.files.clearAll(); // remove all files from uploader
			this._buttonDeleteFiles.disable();
		});

		this._form.elements.submit.attachEvent("onItemClick", () => {
			const values = this._form.getValues();
			//const uploadUrl = `${ajaxActions.getBaseApiUrl()}dataset/${values.dataset}/zip`;
			if (!this._uploader.files.count()) {
				webix.alert(
					{
						type: "alert-warning",
						text: "There is no file for uploading. Please, add zip archive"
					});
				return;
			}
			if (this._form.validate()) {
				let datasetId = values.dataset;
				let signatureObject = {
					signature: values.signature
				};

				this._uploader.files.find((obj) => {
					this._view.showProgress();
					ajaxActions.postBatchUpload(datasetId, signatureObject)
						.then((responseData) => {
							AWS.config.update({
								accessKeyId: responseData.accessKeyId,
								secretAccessKey: responseData.secretAccessKey,
								sessionToken: responseData.sessionToken
							});

							// Store batch identifier
							let batchId = responseData.batchId;

							let s3 = new AWS.S3({
								apiVersion: '2006-03-01'
							});

							let params = {
								Bucket: responseData.bucketName,
								Key: responseData.objectKey,
								Body: obj.file
							};
							s3.upload(params, (err, data) => {
								if (err) {
									webix.message("Something went wrong!");
									this._view.hideProgress();
								} else {
									ajaxActions.finalizePostBatchUpload(datasetId, batchId)
										.then(() => {
											webix.message("You've uploaded zip archive to the server!");
											this._view.hideProgress();

										})
										.fail(() => {
											webix.message("Something went wrong!");
											this._view.hideProgress();
										})
								}
							});
						})
						.fail(() => {
							webix.message("Something went wrong!");
							this._view.hideProgress();
						})
				})
			}
		});
	}

	load() {

	}
}

export default BatchUploadService;
