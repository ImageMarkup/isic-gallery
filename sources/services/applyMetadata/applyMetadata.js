import ajaxActions from "../ajaxActions";
import utils from "../../utils/util";

class ApplyMetadataaService {
	constructor(view, datasetInfoTemplate, form, resultTemplate, validationresultsPanel, fileSelection) {
		this._view = view;
		this._datasetInfoTemplate = datasetInfoTemplate;
		this._form = form;
		this._resultTemplate = resultTemplate;
		this._validationresultsPanel = validationresultsPanel;
		this._fileSelection = fileSelection;
		this._init();
	}

	_init() {
		webix.extend(this._view, webix.ProgressBar);
		this._form.elements.validate.attachEvent("onItemClick", () => {
			const metadataFile = this._form.elements.metadataFile;
			const selectedItem = metadataFile.getList().getItem(metadataFile.getValue());

		});
		this._form.elements.save.attachEvent("onItemClick", () => {
			const metadataFile = this._form.elements.metadataFile;
			const selectedItem = metadataFile.getList().getItem(metadataFile.getValue());
		});
		this._form.elements.download.attachEvent("onItemClick", () => {
			const metadataFile = this._form.elements.metadataFile;
			const selectedItem = metadataFile.getList().getItem(metadataFile.getValue());
		});

		this._form.elements.metadataFile.attachEvent("onChange", (newV) => {
			if (newV) {
				this._form.elements.validate.enable();
				this._form.elements.download.enable();
			}
			//this._validationresultsPanel.hide();
		});
	}

	load(datasetId) {
		this._datasetId = datasetId;
	}
}

export default ApplyMetadataaService;
