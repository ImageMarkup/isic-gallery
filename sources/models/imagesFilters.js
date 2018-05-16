import ajax from "../services/ajaxActions";
import state from "../models/state";

let filtersData = [
	{
		"label": "Diagnostic Attributes",
		"data": [
			{
				"id": "meta.clinical.benign_malignant",
				"name": "Benign or Malignant",
				"type": "checkbox",
				"datatype": "string",
				"options": ["benign", "indeterminate", "indeterminate/benign", "indeterminate/malignant", "malignant", null]
			},
			{
				"id": "meta.clinical.diagnosis",
				"name": "Lesion Diagnosis",
				"type": "checkbox",
				"datatype": "string",
				"options": ["actinic keratosis", "angiofibroma or fibrous papule", "atypical melanocytic proliferation", "basal cell carcinoma", "dermatofibroma", "lentigo NOS",
					"lentigo simplex", "lichenoid keratosis", "melanoma", "nevus", "other", "scar", "seborrheic keratosis", "solar lentigo", "squamous cell carcinoma", null]
			}]
	},
	{
		"label": "Clinical Attributes",
		"data": [
			{
				"id": "meta.clinical.age_approx",
				"name": "Approximate Age",
				"type": "rangeCheckbox",
				"datatype": "number",
				"options": [
					{highBound: 10, label: "[0 - 10)", lowBound: 0},
					{highBound: 20, label: "[10 - 20)", lowBound: 10},
					{highBound: 30, label: "[20 - 30)", lowBound: 20},
					{highBound: 40, label: "[30 - 40)", lowBound: 30},
					{highBound: 50, label: "[40 - 50)", lowBound: 40},
					{highBound: 60, label: "[50 - 60)", lowBound: 50},
					{highBound: 70, label: "[60 - 70)", lowBound: 60},
					{highBound: 80, label: "[70 - 80)", lowBound: 70},
					{highBound: 90, label: "[80 - 90)", lowBound: 80},
					null
				]
			},
			{
				"id": "meta.clinical.clin_size_long_diam_mm",
				"name": "Clinical Size - Longest Diameter (mm)",
				"type": "rangeCheckbox",
				"datatype": "number",
				"options": [
					{highBound: 10, label: "[0.0 - 10.0)", lowBound: 0},
					{highBound: 20, label: "[10.0 - 20.0)", lowBound: 10},
					{highBound: 30, label: "[20.0 - 30.0)", lowBound: 20},
					{highBound: 40, label: "[30.0 - 40.0)", lowBound: 30},
					{highBound: 50, label: "[40.0 - 50.0)", lowBound: 40},
					{highBound: 90, label: "[80.0 - 90.0)", lowBound: 80},
					{highBound: 110, label: "[100.0 - 110.0)", lowBound: 100},
					null
				]
			},
			{
				"id": "meta.clinical.diagnosis_confirm_type",
				"name": "Type of Diagnosis",
				"type": "checkbox",
				"datatype": "string",
				"options": ["histopathology", "single image expert consensus", null]
			},
			{
				"id": "meta.clinical.family_hx_mm",
				"name": "Family History of Melanoma",
				"type": "checkbox",
				"datatype": "boolean",
				"options": ["true", "false", null]
			},
			/*{
				"id": "meta.clinical.mel_class",
				"name": "Melanoma Class",
				"type": "checkbox",
				"datatype": "string",
				"options": [null]
			},
			{
				"id": "meta.clinical.mel_mitotic_index",
				"name": "Melanoma Mitotic Index",
				"type": "checkbox",
				"datatype": "string",
				"options": [null]
			},
			{
				"id": "meta.clinical.mel_thick_mm",
				"name": "Melanoma Thickness (mm)",
				"type": "checkbox",
				"datatype": "string",
				"options": [null]
			},
			{
				"id": "meta.clinical.mel_type",
				"name": "Melanoma Type",
				"type": "checkbox",
				"datatype": "string",
				"options": [null]
			},*/
			{
				"id": "meta.clinical.mel_ulcer",
				"name": "Melanoma Ulceration",
				"type": "checkbox",
				"datatype": "boolean",
				"options": ["true", "false", null]
			},
			{
				"id": "meta.clinical.melanocytic",
				"name": "Melanocytic",
				"type": "checkbox",
				"datatype": "boolean",
				"options": ["true", "false", null]
			},
			{
				"id": "meta.clinical.nevus_type",
				"name": "Nevus Type",
				"type": "checkbox",
				"datatype": "string",
				"options": ["blue", "combined", "halo", "nevus NOS", "persistent/recurrent", "pigmented spindle cell of reed", "plexiform spindle cell", "spitz", null]
			},
			{
				"id": "meta.clinical.personal_hx_mm",
				"name": "Personal History of Melanoma",
				"type": "checkbox",
				"datatype": "boolean",
				"options": ["true", "false", null]
			},
			{
				"id": "meta.clinical.sex",
				"name": "Sex",
				"type": "checkbox",
				"datatype": "string",
				"options": ["female", "male", null]
			}
		]
	},
	{
		"label": "Technological Attributes",
		"data": [
			{
				"id": "meta.acquisition.dermoscopic_type",
				"name": "Dermoscopic Type",
				"type": "checkbox",
				"datatype": "string",
				"options": ["contact non-polarized", "contact polarized", "non-contact polarized", null]
			},
			{
				"id": "meta.acquisition.image_type",
				"name": "Image Type",
				"type": "checkbox",
				"datatype": "string",
				"options": ["clinical", "dermoscopic", null]
			}]
	},
	// this block must be in the end of array
	{
		"label": "Database Attributes",
		"data": []
	}
];

function isNeedShow(datasetId) {
	const hiddenDatasetIds = [
		"5a74e97a11659731f017fabf", // Dermoscopedia (CC-0)
		"5a74e98611659731f017fac3" // Dermoscopedia (CC-BY-NC)
	];
	return hiddenDatasetIds.indexOf(datasetId) === -1;
}

function prepareDatasetFilterData(dataset) {
	const result = [];
	state.datasetMapForFilters = {};
	const options = [];
	dataset.forEach((item) => {
		if (isNeedShow(item._id)) {
			state.datasetMapForFilters[item._id] = item.name;
			options.push(item._id); // we set id as options value. we will replace it with "name" from state.datasetForFilters before rendering checkboxes
		}
	});
	result.push({
		"id": "meta.datasetId",
		"name": "Dataset",
		"type": "checkbox",
		"datatype": "objectid",
		"options": options
	});
	return result;
}

function getFiltersData(forceRebuild) {
	return new Promise((resolve) => {
		// we should rewrite the last item in filtersData (it is place for Database Attributes)
		const DATASET_POSITION = filtersData.length - 1;
		const DB_ATTRIBUTE_LABEL = "Database Attributes";
		// if we have no datasets  we should get them with ajax and add to 'filtersData'
		if (forceRebuild || (filtersData[DATASET_POSITION].label === DB_ATTRIBUTE_LABEL && !filtersData[DATASET_POSITION].data.length)) {
			ajax.getDataset().then((dataset) => {
				filtersData[DATASET_POSITION] = {
					"label": DB_ATTRIBUTE_LABEL,
					"data": prepareDatasetFilterData(dataset)
				};
				resolve (filtersData);
			});
		}
		else {
			resolve(filtersData);
		}
	});
}

export default {
	getFiltersData
};
