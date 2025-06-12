import constants from "../constants";
import diagnosisModel from "./diagnosis";
import state from "./state";

let filtersData;

const filtersIds = {
	pinnedCollections: "collections",
	lesionDiagnosis: "diagnosis",
	approximateAge: "age_approx",
	generalAnatomicSite: "anatom_site_general",
	specialAnatomicSite: "anatom_site_special",
	clinicalSize: "clin_size_long_diam_mm",
	typeDiagnosis: "diagnosis_confirm_type",
	familyHistoryMelanoma: "family_hx_mm",
	melanomaClass: "mel_class",
	melanomaMitoticIndex: "mel_mitotic_index",
	melanomaThickness: "mel_thick_mm",
	melanomaType: "mel_type",
	melanomaUlceration: "mel_ulcer",
	melanocytic: "melanocytic",
	nevusType: "nevus_type",
	personalHistoryMelanoma: "personal_hx_mm",
	sex: "sex",
	dermoscopicType: "dermoscopic_type",
	tbpType: "tbp_tile_type",
	imageManipulation: "image_manipulation",
	imageType: "image_type",
	colorTint: "color_tint",
	license: "copyright_license",
	fitzpatrickSkinType: "fitzpatrick_skin_type"
};

function getFiltersDataValues() {
	const diagnosisData = diagnosisModel.getDiagnosisDataForFilters();
	const filtersDataValues = [
		{
			label: "Diagnostic Attributes",
			data: [
				{
					id: filtersIds.lesionDiagnosis,
					name: "Lesion diagnosis",
					type: constants.FILTER_ELEMENT_TYPE.TREE_CHECKBOX,
					datatype: "string",
					options: diagnosisData
				},
				{
					id: filtersIds.typeDiagnosis,
					name: "Type of Diagnosis",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.typeDiagnosis]
				},
				{
					id: filtersIds.melanocytic,
					name: "Melanocytic",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.melanocytic]
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
					id: filtersIds.melanomaUlceration,
					name: "Melanoma Ulceration",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.melanomaUlceration]
				},
			]
		},
		{
			label: "Clinical Attributes",
			data: [
				{
					id: filtersIds.sex,
					name: "Sex",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.sex]
				},
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
					id: filtersIds.specialAnatomicSite,
					name: "Special Anatomic Site",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.specialAnatomicSite]
				},
				{
					id: filtersIds.fitzpatrickSkinType,
					name: "Fitzpatrick Skin Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.fitzpatrickSkinType]
				},
				{
					id: filtersIds.clinicalSize,
					name: "Clinical Size - Longest Diameter (mm)",
					type: "rangeCheckbox",
					datatype: "number",
					options: state.imagesTotalCounts[filtersIds.clinicalSize]
				},
				{
					id: filtersIds.familyHistoryMelanoma,
					name: "Family History of Melanoma",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.familyHistoryMelanoma]
				},
				{
					id: filtersIds.personalHistoryMelanoma,
					name: "Personal History of Melanoma",
					type: "checkbox",
					datatype: "boolean",
					options: state.imagesTotalCounts[filtersIds.personalHistoryMelanoma]
				},
			]
		},
		{
			label: "Technological Attributes",
			data: [
				{
					id: filtersIds.imageType,
					name: "Image Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.imageType]
				},
				{
					id: filtersIds.dermoscopicType,
					name: "Dermoscopic Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.dermoscopicType]
				},
				{
					id: filtersIds.tbpType,
					name: "TBP Type",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.tbpType]
				},
				{
					id: filtersIds.imageManipulation,
					name: "Image Manipulation",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.imageManipulation]
				},
			]
		},
		{
			label: "Other Attributes",
			data: [
				{
					id: filtersIds.license,
					name: "License",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.license]
				},
				{
					id: filtersIds.pinnedCollections,
					name: "Collection",
					type: "checkbox",
					datatype: "string",
					options: state.imagesTotalCounts[filtersIds.pinnedCollections] ?? []
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
			/* we set id as options value.
			we will replace it with "name" from state.datasetForFilters
			before rendering checkboxes */
			options.push(item._id);
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
		resolve(filtersData);
	});
}

export default {
	getFiltersData
};
