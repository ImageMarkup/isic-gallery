import ajaxActions from "../ajaxActions";
import utils from "../../utils/util";

class ApplyMetadataaService {
	constructor(view, datasetInfoTemplate, form, rasultTemplate, validationresultsPanel, fileSelection) {
		this._view = view;
		this._datasetInfoTemplate = datasetInfoTemplate;
		this._form = form;
		this._rasultTemplate = rasultTemplate;
		this._validationresultsPanel = validationresultsPanel;
		this._fileSelection = fileSelection;
		this._init();
	}

	_init() {
		webix.extend(this._view, webix.ProgressBar);
		this._form.elements.validate.attachEvent("onItemClick", () => {
			const metadataFile = this._form.elements.metadataFile;
			const selectedItem = metadataFile.getList().getItem(metadataFile.getValue());

			this._view.showProgress();
			ajaxActions.postDatasetMetadata(this._datasetId, selectedItem.file._id)
				.then((data) => {
					const templateData = webix.copy(data);
					templateData.fileInfo = webix.copy(selectedItem);
					this._rasultTemplate.setValues(templateData);
					this._validationresultsPanel.show();
					if (data.errors && !data.errors.length) {
						this._form.elements.save.enable();
					}
					else {
						this._form.elements.save.disable();
					}
					this._view.hideProgress();
				})
				.fail(() => {
					this._view.hideProgress();
				});
		});
		this._form.elements.save.attachEvent("onItemClick", () => {
			const metadataFile = this._form.elements.metadataFile;
			const selectedItem = metadataFile.getList().getItem(metadataFile.getValue());
			this._view.showProgress();
			ajaxActions.postDatasetMetadata(this._datasetId, selectedItem.file._id, {save: true})
				.then(() => {
					this._view.hideProgress();
					webix.message("Metadata has been saved");
				})
				.fail(() => {
					this._view.hideProgress();
				});
		});
		this._form.elements.download.attachEvent("onItemClick", () => {
			const metadataFile = this._form.elements.metadataFile;
			const selectedItem = metadataFile.getList().getItem(metadataFile.getValue());
			let downloadUrl = ajaxActions.getUrlForDownloadRegisteredMetadata(this._datasetId, selectedItem.file._id);
			utils.downloadByLink(downloadUrl);
		});

		this._form.elements.metadataFile.attachEvent("onChange", (newV) => {
			if (newV) {
				this._form.elements.validate.enable();
				this._form.elements.download.enable();
			}
			this._validationresultsPanel.hide();
		});
	}

	load(datasetId) {
		this._datasetId = datasetId;
		ajaxActions.getDatasetItem(datasetId).then((data) => {
			this._datasetInfoTemplate.setValues(data);
		});
		ajaxActions.getDatasetMetadata(this._datasetId).then((data) => {
			const options = this._form.elements.metadataFile;
			const list = options.getList();
			list.parse(data);
			list.sort("time", "desc");
		});
	}
}

export default ApplyMetadataaService;
