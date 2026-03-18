import createTreeModel from "./createTreeModel";
import anatomyFlat from "./flatStructures/anatomy-flat.json";
import diagnosisFlat from "./flatStructures/iddx-flat.json";

const TREE_MODELS_DEFINITION = [
	{
		key: "anatom_site",
		flatData: anatomyFlat,
		regex: /^anatom_site_\d+$/,
	},
	{
		key: "diagnosis",
		flatData: diagnosisFlat,
		regex: /^diagnosis_\d+$/,
	}
];

export const TREE_MODELS_CONFIG = TREE_MODELS_DEFINITION.reduce((config, def) => {
	const model = createTreeModel(def.flatData, {filterPrefixRegex: def.regex});
	config[def.key] = {
		key: def.key,
		regex: def.regex,
		model
	};
	return config;
}, {});

export const findTreeModelConfig = filterKey => Object.values(
	TREE_MODELS_CONFIG
).find(config => config.regex.test(filterKey));

const TREE_MODELS_KEYS = new Set(Object.values(TREE_MODELS_CONFIG).map(c => c.key));
export const isTreeModel = key => TREE_MODELS_KEYS.has(key);
