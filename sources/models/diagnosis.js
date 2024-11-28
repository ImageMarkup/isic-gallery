/**
 * @typedef {Object} Diagnosis
 * @property {number} level
 * @property {string | null} parent
 * @property {string} concatenate
 * @property {Array | null} children
 */
import diagnosisFlat from "./iddx-flat.json";
import diagnosisTree from "./iddx-tree.json";

const CONCATENATE_SEPARATOR = "::";
const diagnosisArray = [];
const displayDiagnosis = [];

function getDiagnosisFlat() {
	return diagnosisFlat;
}

function getDiagnosisDataForFilters() {
	const data = convertDiagnosisToTreeArray(diagnosisTree);
	return data;
}

function convertDiagnosisToTreeArray(tree) {
	const dataForFilters = [];
	const diagnosisKeys = Object.keys(tree);
	diagnosisKeys.forEach((k) => {
		const diagnosisItem = {};
		diagnosisItem.id = diagnosisFlat[k].concatenate.replaceAll(CONCATENATE_SEPARATOR, "|");
		diagnosisItem.name = k;
		diagnosisItem.type = "treeCheckbox";
		diagnosisItem.datatype = "string";
		diagnosisItem.level = diagnosisFlat[k].level;
		diagnosisItem.data = diagnosisFlat[k].children
			? convertDiagnosisToTreeArray(tree[k].children)
			: null;
		diagnosisItem.parent = diagnosisFlat[k].parent;
		dataForFilters.push(diagnosisItem);
	});
	return dataForFilters;
}

function getDiagnosisConcatenateValue(id) {
	return diagnosisFlat[id]?.concatenate.replaceAll(CONCATENATE_SEPARATOR, "|");
}

function getDiagnosisValuesByLevel(filterKey) {
	const diagnosisValues = [];
	if (diagnosisArray.length === 0) {
		const diagnosisFlatKeys = Object.keys(diagnosisFlat);
		diagnosisFlatKeys.forEach((k) => {
			const diagnosisItem = {...diagnosisFlat[k]};
			diagnosisItem.id = k;
			diagnosisArray.push(diagnosisItem);
		});
	}
	switch (filterKey) {
		case "diagnosis_1": {
			diagnosisValues.push(
				...diagnosisArray
					.filter(d => d.level === 1)
					.map(d => d.id)
			);
			break;
		}
		case "diagnosis_2": {
			diagnosisValues.push(
				...diagnosisArray
					.filter(d => d.level === 2)
					.map(d => d.id)
			);
			break;
		}
		case "diagnosis_3": {
			diagnosisValues.push(
				...diagnosisArray
					.filter(d => d.level === 3)
					.map(d => d.id)
			);
			break;
		}
		case "diagnosis_4": {
			diagnosisValues.push(
				...diagnosisArray
					.filter(d => d.level === 4)
					.map(d => d.id)
			);
			break;
		}
		case "diagnosis_5": {
			diagnosisValues.push(
				...diagnosisArray
					.filter(d => d.level === 5)
					.map(d => d.id)
			);
			break;
		}
		default: {
			break;
		}
	}
	return diagnosisValues;
}

function addDisplayDiagnosis(dArray) {
	displayDiagnosis.push(...dArray);
}

function getDisplayDiagnosis() {
	return displayDiagnosis;
}

const diagnosisModel = {
	getDiagnosisFlat,
	getDiagnosisDataForFilters,
	getDiagnosisConcatenateValue,
	getDiagnosisValuesByLevel,
	addDisplayDiagnosis,
	getDisplayDiagnosis,
};

export default diagnosisModel;
