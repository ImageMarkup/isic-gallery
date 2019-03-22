import ajax from "../services/ajaxActions";
import state from "../models/state";

let filtersData;

const filtersIds = {
	benignMelignant: "meta.clinical.benign_malignant",
	lesionDiagnosis: "meta.clinical.diagnosis",
	approximateAge: "meta.clinical.age_approx",
	generalAnatomicSite: "meta.clinical.anatom_site_general",
	clinicalSize: "meta.clinical.clin_size_long_diam_mm",
	typeDiagnosis: "meta.clinical.diagnosis_confirm_type",
	familyHistoryMelanoma: "meta.clinical.family_hx_mm",
	melanomaClass: "meta.clinical.mel_class",
	melanomaMitoticIndex: "meta.clinical.mel_mitotic_index",
	melanomaThickness: "meta.clinical.mel_thick_mm",
	melanomaType: "meta.clinical.mel_type",
	melanomaUlceration: "meta.clinical.mel_ulcer",
	melanocytic: "meta.clinical.melanocytic",
	nevusType: "meta.clinical.nevus_type",
	personalHistoryMelanoma: "meta.clinical.personal_hx_mm",
	sex: "meta.clinical.sex",
	dermoscopicType: "meta.acquisition.dermoscopic_type",
	imageType: "meta.acquisition.image_type",
	datasetTags: "meta.tags"
};

function getFiltersDataValues() {
	const filtersDataValues = [
		{
			label: "Diagnostic Attributes",
			data: [
				{
					id: filtersIds.benignMelignant,
					name: "Benign or Malignant",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.benignMelignant]
				},
				{
					id: filtersIds.lesionDiagnosis,
					name: "Lesion Diagnosis",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.lesionDiagnosis]
				}]
		},
		{
			label: "Clinical Attributes",
			data: [
				{
					id: filtersIds.approximateAge,
					name: "Approximate Age",
					type: "rangeCheckbox",
					datatype: "number",
					options: state.imagesTotalCounts[filtersIds.approximateAge]
				},
				{
					id: filtersIds.generalAnatomicSite,
					name: "General Anatomic Site",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.generalAnatomicSite]
				},
				{
					id: filtersIds.clinicalSize,
					name: "Clinical Size - Longest Diameter (mm)",
					type: "rangeCheckbox",
					datatype: "number",
					options: state.imagesTotalCounts[filtersIds.clinicalSize]
				},
				{
					id: filtersIds.typeDiagnosis,
					name: "Type of Diagnosis",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.typeDiagnosis]
				},
				{
					id: filtersIds.familyHistoryMelanoma,
					name: "Family History of Melanoma",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.familyHistoryMelanoma]
				},
				{
					id: filtersIds.melanomaClass,
					name: "Melanoma Class",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.melanomaClass]
				},
				{
					id: filtersIds.melanomaMitoticIndex,
					name: "Melanoma Mitotic Index",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.melanomaMitoticIndex]
				},
				{
					id: filtersIds.melanomaThickness,
					name: "Melanoma Thickness (mm)",
					type: "rangeCheckbox",
					datatype: "number",
					options: state.imagesTotalCounts[filtersIds.melanomaThickness]
				},
				{
					id: filtersIds.melanomaType,
					name: "Melanoma Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.melanomaType]
				},
				{
					id: filtersIds.melanomaUlceration,
					name: "Melanoma Ulceration",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.melanomaUlceration]
				},
				{
					id: filtersIds.melanocytic,
					name: "Melanocytic",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.melanocytic]
				},
				{
					id: filtersIds.nevusType,
					name: "Nevus Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.nevusType]
				},
				{
					id: filtersIds.personalHistoryMelanoma,
					name: "Personal History of Melanoma",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.personalHistoryMelanoma]
				},
				{
					id: filtersIds.sex,
					name: "Sex",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.sex]
				}
			]
		},
		{
			label: "Technological Attributes",
			data: [
				{
					id: filtersIds.dermoscopicType,
					name: "Dermoscopic Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.dermoscopicType]
				},
				{
					id: filtersIds.imageType,
					name: "Image Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.imageType]
				}]
		},
		// this block must be in the end of array
		{
			label: "Database Attributes",
			data: [
				{
					id: filtersIds.datasetTags,
					name: "Tags",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.datasetTags]
				}
			]
		}
	];
	return filtersDataValues;
}

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
		id: "meta.datasetId",
		name: "Dataset",
		type: "checkbox",
		datatype: "objectid",
		options
	});
	return result;
}

function getFiltersData(forceRebuild) {
	return new Promise((resolve) => {
		// we should rewrite the last item in filtersData (it is place for Database Attributes)
		if (forceRebuild || !filtersData) {
			filtersData = getFiltersDataValues();
		}
		const DATASET_POSITION = filtersData.length - 1;
		const DB_ATTRIBUTE_LABEL = "Database Attributes";
		// if we have no datasets  we should get them with ajax and add to 'filtersData'
		if ((forceRebuild || filtersData[DATASET_POSITION].label === DB_ATTRIBUTE_LABEL) && filtersData[DATASET_POSITION].data.length === 1) {
			ajax.getDataset().then((dataset) => {
				if (filtersData[DATASET_POSITION].data.length === 1) {
					filtersData[DATASET_POSITION] = {
						label: DB_ATTRIBUTE_LABEL,
						data: filtersData[DATASET_POSITION].data.concat(prepareDatasetFilterData(dataset))
					};
				}
				resolve(filtersData);
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
