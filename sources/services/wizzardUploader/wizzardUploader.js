import ajaxActions from "../ajaxActions";
import util from "../../utils/util";
import storage from "../../models/wizardUploaderStorage";

class WizzardUploaderService {
	constructor(view, form, uploader, removeButton, exportButton, clearSessionButton, previewTemplate, dropArea) {
		this._view = view;
		this._form = form;
		this._uploader = uploader;
		this._removeButton = removeButton;
		this._exportButton = exportButton;
		this._clearSessionButton = clearSessionButton;
		this._previewTemplate = previewTemplate;
		this._dropArea = dropArea;
		this._init();
	}

	_init() {
		if (storage.getFilesInfoFromStorage()) {
			this._exportButton.enable();
		}

		ajaxActions.getDataset().then((data) => {
			if (data && data.map) {
				const preparedData = data.map((item) => {
					const newItem = webix.copy(item);
					newItem.id = item._id;
					return newItem;
				});
				this._form.elements.dataset.getList().parse(preparedData);
			}
		});

		this._view.on(this._view.app, "imageAdded", () => {
			this._exportButton.enable();
		});

		this._clearSessionButton.attachEvent("onItemClick", () => {
			const self = this;
			webix.confirm({
				text: "If you clear session you will loose possibility to make CSV file with images data, that you have uploded from your last browser openning till current time. Do you really want to clear session?",
				type: "confirm-error",
				callback(result) {
					if (result) {
						self._form.elements.signature.enable();
						self._uploader.files.clearAll();
						storage.clearAll();
						self._clearForm();
						self._removeButton.disable();
						self._exportButton.disable();
						self._dropArea.show(false, false);
					}
				}
			});
		});

		this._exportButton.attachEvent("onItemClick", () => {
			this._exportCsv();
		});

		this._removeButton.attachEvent("onItemClick", () => {
			this._removeFiles();
		});

		this._uploader.attachEvent("onBeforeFileDrop", (files) => {
			if (files.length !== 1 || !files[0].type) {
				webix.alert({type: "alert-warning", text: "You can upload only one image"});
				return false;
			}
		});

		this._uploader.attachEvent("onAfterFileAdd", () => {
			const fileData = this._uploader.files.getItem(this._uploader.files.getFirstId());
			this._form.elements.filename.setValue(fileData.name);
			const url = URL.createObjectURL(fileData.file);
			this._previewTemplate.setValues({src: url});
			this._previewTemplate.show(false, false);
			this._removeButton.enable();
		});

		// This mark is needed for correct processing several files after drag and drop. We should show alert only once. But "onBeforeFileAdd" calls for every attempt
		// this.isNeedShowNotOneFileAlert = false;
		this._uploader.attachEvent("onBeforeFileAdd", (item) => {
			if (!item.size) {
				webix.alert({type: "alert-warning", text: "Please, select not empty file"});
				return false;
			}
			if (this._uploader.files.count()) {
				webix.alert({type: "alert-warning", text: "You can upload only one image"});
				return false;
			}
		});

		this._form.elements.submit.attachEvent("onItemClick", () => {
			const values = this._form.getValues();
			if (!this._uploader.files.count()) {
				webix.alert(
					{
						type: "alert-error",
						text: "There are no image for uploading. Please, add image"
					});
				return;
			}
			if (!this._form.elements.signature_approve.getValue()) {
				webix.alert(
					{
						type: "alert-error",
						text: "You should confirm your signature by checkbox mark"
					});
				return;
			}
			if (this._form.validate()) {
				const fileItem = this._uploader.files.getItem(this._uploader.files.getFirstId());
				ajaxActions.addImageToDataset(values.dataset, values, fileItem.file).then((imageData) => {
					if (imageData) {
						webix.message("Image has been uploaded");
						const preparedValues = this._prepareDataForStorage(values);
						const params = {
							metadata: preparedValues,
							save: true
						};
						ajaxActions.addImageMetadata(imageData._id, params).then(() => {
							webix.message("Metadata has been saved");
							preparedValues.id = imageData._id;
							storage.addFileInfoToStorage(preparedValues);
							storage.saveSignature(this._form.elements.signature.getValue());
							this._view.app.callEvent("imageAdded");
							this._clearForm();
						});
					}
				});
				this._uploader.files.clearAll();
				this._removeButton.disable();
			}
		});
		this._initFormRestrictions();
	}

	_clearForm() {
		// we block event because clear method call onChange event for signature_approve.  we need to prevent event
		this._form.elements.signature_approve.blockEvent();
		this._form.clear();
		this._form.elements.signature_approve.unblockEvent();
		const lastStoredFile = storage.getLastFile();
		let values = {
			signature_approve: 1,
			image_type: lastStoredFile ? lastStoredFile.image_type : "",
			diagnosis_confirm_type: lastStoredFile ? lastStoredFile.diagnosis_confirm_type : ""
		};
		const signature = storage.getSignature();
		if (signature) {
			this._form.elements.signature.disable();
			this._form.elements.signature_approve.show();
			values.signature = signature;
		}
		else {
			this._form.elements.signature.enable();
			this._form.elements.signature_approve.hide();
		}
		this._form.clearValidation();
		this._form.setValues(values);
	}

	_removeFiles() {
		this._form.elements.filename.setValue("");
		this._uploader.files.clearAll(); // remove all files from uploader
		this._removeButton.disable();
		this._dropArea.show(false, false);
	}

	_initFormRestrictions() {

		this._form.elements.signature_approve.attachEvent("onChange", (newv, oldv) => {
			if (storage.getSignature() && newv == 0) {
				webix.alert({type: "alert-warning", text: "Please, clear session, if you want to change signature"});
				this._form.elements.signature_approve.blockEvent();
				this._form.elements.signature_approve.setValue(oldv);
				this._form.elements.signature_approve.unblockEvent();
			}
		});

		this._form.elements.mel_thick_mm.attachEvent("onChange", (newv) => {
			let numValue = parseFloat(newv);

			if (numValue <= 0.8) {
				this._form.elements.thickness_categorical.setValue("less than 0.8");
			}
			if (numValue > 0.8 && numValue <= 1) {
				this._form.elements.thickness_categorical.setValue("more than 0.8");
			}
			if (numValue > 1 && numValue <= 2) {
				this._form.elements.thickness_categorical.setValue("more than 1");
			}
			if (numValue > 2 && numValue <= 3) {
				this._form.elements.thickness_categorical.setValue("more than 2");
			}
			if (numValue > 3 && numValue <= 4) {
				this._form.elements.thickness_categorical.setValue("more than 3");
			}
			if (numValue > 4 && numValue <= 5) {
				this._form.elements.thickness_categorical.setValue("more than 4");
			}
			if (numValue > 5) {
				this._form.elements.thickness_categorical.setValue("more than 5");
			}
		});

		this._form.elements.mel_class.attachEvent("onChange", (newv) => {
			if (newv === "melanoma in situ") {
				this._form.elements.mel_thick_mm.setValue("0");
			}
		});

		this._form.elements.benign_malignant.attachEvent("onChange", (newv) => {
			if (newv === "benign") {
				this._form.elements.mel_thick_mm.setValue("");
				this._form.elements.thickness_categorical.setValue("not applicable");
				this._form.elements.mel_class.setValue("not applicable");
				this._form.elements.mel_type.setValue("not applicable");
				this._form.elements.mel_mitotic_index.setValue("not applicable");
				this._form.elements.mel_ulcer.setValue("not applicable");
			}
		});

		this._form.elements.diagnosis.attachEvent("onChange", (newv) => {
			if (newv === "benign") {
				this._form.elements.mel_thick_mm.setValue("");
				this._form.elements.thickness_categorical.setValue("not applicable");
				this._form.elements.mel_class.setValue("not applicable");
				this._form.elements.mel_type.setValue("not applicable");
				this._form.elements.mel_mitotic_index.setValue("not applicable");
				this._form.elements.mel_ulcer.setValue("not applicable");
			}
			if (!(newv === "melanoma" && newv === "melanoma metastasis")) {
				this._form.elements.mel_class.setValue("not applicable");
				this._form.elements.mel_type.setValue("not applicable");
				this._form.elements.mel_mitotic_index.setValue("not applicable");
				this._form.elements.mel_ulcer.setValue("not applicable");
				this._form.elements.benign_malignant.setValue("");
				this._form.elements.thickness_categorical.setValue("not applicable");
			}
			if (newv === "melanoma" || newv === "melanoma metastasis") {
				this._form.elements.benign_malignant.setValue("malignant");
				this._form.elements.mel_class.setValue("");
				this._form.elements.mel_type.setValue("");
				this._form.elements.mel_mitotic_index.setValue("");
				this._form.elements.mel_ulcer.setValue("");
				this._form.elements.nevus_type.setValue("not applicable");
				this._form.elements.thickness_categorical.setValue("");
			}
			if (newv === "nevus") {
				this._form.elements.benign_malignant.setValue("benign");
				this._form.elements.mel_class.setValue("not applicable");
				this._form.elements.mel_type.setValue("not applicable");
				this._form.elements.mel_mitotic_index.setValue("not applicable");
				this._form.elements.mel_ulcer.setValue("not applicable");
				this._form.elements.nevus_type.setValue("");
				this._form.elements.mel_thick_mm.setValue("");
				this._form.elements.thickness_categorical.setValue("not applicable");
			}
			if (newv !== "nevus") {
				this._form.elements.nevus_type.setValue("not applicable");
			}
		});
	}

	_prepareDataForStorage(data) {
		const prepared = webix.copy(data);
		delete prepared.submit;
		delete prepared.dataset;
		return prepared;
	}

	_prepareDataForExportCsv(data) {
		const result = [];
		if (!data) {
			return result;
		}
		const headers = ["id", "filename", "age", "sex", "image_type", "dx_confirm_type", "diagnosis", "benign_malignant", "nevus_type", "camera_type", "melanoma_class", "melanoma_subtype", "mitotic_index", "ulcer", "thickness_mm", "thickness_categorical"];
		result.push(headers);
		data.forEach((item) => {
			const values = [];
			values.push(item.id !== "undefined" ? item.id : "");
			values.push(item.filename !== "undefined" ? item.filename : "");
			values.push(item.age !== "undefined" ? item.age : "");
			values.push(item.sex !== "undefined" ? item.sex : "");
			values.push(item.image_type !== "undefined" ? item.image_type : "");
			values.push(item.diagnosis_confirm_type !== "undefined" ? item.diagnosis_confirm_type : "");
			values.push(item.diagnosis !== "undefined" ? item.diagnosis : "");
			values.push(item.benign_malignant !== "undefined" ? item.benign_malignant : "");
			values.push(item.nevus_type !== "undefined" ? item.nevus_type : "");
			values.push(item.camera_type !== "undefined" ? item.camera_type : "");
			values.push(item.mel_class !== "undefined" ? item.mel_class : "");
			values.push(item.mel_type !== "undefined" ? item.mel_type : "");
			values.push(item.mel_mitotic_index !== "undefined" ? item.mel_mitotic_index : "");
			values.push(item.mel_ulcer !== "undefined" ? item.mel_ulcer : "");
			values.push(item.mel_thick_mm !== "undefined" ? item.mel_thick_mm : "");
			values.push(item.thickness_categorical !== "undefined" ? item.thickness_categorical : "");

			result.push(values);
		});
		return result;
	}

	_exportCsv() {
		const data = storage.getFilesInfoFromStorage();
		util.exportCsv(this._prepareDataForExportCsv(data));
	}
}

export default WizzardUploaderService;
