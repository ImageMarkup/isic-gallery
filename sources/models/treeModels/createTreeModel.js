import ajaxActions from "app-services/ajaxActions";

const CONCATENATE_SEPARATOR = "::";

/**
 * @typedef {Object} FlatNode
 * @property {number} level
 * @property {string|null} parent
 * @property {string} concatenate
 * @property {string[]} children
 */

/**
 * @typedef {Object.<string, FlatNode>} FlatTree
 */

/**
 * @typedef {Object} TreeNode
 * @property {number} level
 * @property {string|null} parent
 * @property {Object.<string, TreeNode>|null} [children]
 */

/**
 * @typedef {Object.<string, TreeNode>} TreeRoot
 */

/**
 * @param {FlatTree} flat
 * @returns {TreeRoot}
 */
function flatToTree(flat) {
	const buildNode = (name) => {
		const flatNode = flat[name];
		const node = {
			level: flatNode.level,
			parent: flatNode.parent,
		};

		const childNames = flatNode.children;
		if (childNames) {
			node.children = Object.fromEntries(
				childNames
					.filter(childName => childName in flat)
					.map(childName => [childName, buildNode(childName)]),
			);
		}

		return node;
	};

	return Object.fromEntries(
		Object.entries(flat)
			.filter(([, node]) => node.parent === null)
			.map(([name]) => [name, buildNode(name)]),
	);
}

export default function createTreeModel(flatData, config) {
	const {filterPrefixRegex} = config;

	const tree = flatToTree(flatData);
	const itemArray = [];
	const displayItems = [];

	const getOrInitArray = () => {
		if (itemArray.length === 0) {
			Object.keys(flatData).forEach((k) => {
				const item = {...flatData[k], id: k};
				itemArray.push(item);
			});
		}
		return itemArray;
	};

	const getDataForFilters = async () => {
		const facets = await ajaxActions.getFacets();
		const keys = Object.keys(facets).filter(key => filterPrefixRegex.test(key));
		const countMap = new Map();

		keys.forEach((key) => {
			(facets[key].buckets || []).forEach((bucket) => {
				countMap.set(bucket.key, bucket.doc_count ?? 0);
			});
		});

		return convertToTreeArray(tree, countMap);
	};

	const convertToTreeArray = (treeData, countMap) => {
		const result = [];
		const keys = Object.keys(treeData);

		keys.forEach((k) => {
			if (displayItems.find(d => d === k)) {
				const item = {
					id: flatData[k].concatenate.replaceAll(CONCATENATE_SEPARATOR, "|"),
					name: k,
					displayName: k,
					type: "treeCheckbox",
					datatype: "string",
					level: flatData[k].level,
					data: flatData[k].children
						? convertToTreeArray(treeData[k].children, countMap)
						: null,
					parent: flatData[k].parent,
				};

				const optionCount = countMap.get(k) ?? 0;
				const optionChildrenCount = (flatData[k].children || []).reduce(
					(sum, childKey) => sum + (countMap.get(childKey) ?? 0),
					0,
				);

				item.hasHiddenOption = optionCount > optionChildrenCount;
				result.push(item);
			}
		});

		return result;
	};

	const getConcatenateValue = id => flatData[id]?.concatenate?.replaceAll(CONCATENATE_SEPARATOR, "|");

	const getValuesByLevel = (filterKey) => {
		const values = [];
		const array = getOrInitArray();

		const level = parseInt(filterKey.match(/\d+/)?.[0] || "0");
		if (level > 0) {
			values.push(...array.filter(d => d.level === level).map(d => d.id));
		}

		return values;
	};

	const addDisplayItems = (items) => {
		displayItems.push(...items);
	};

	const getDisplayItems = () => displayItems;

	return {
		getDataForFilters,
		getConcatenateValue,
		getValuesByLevel,
		addDisplayItems,
		getDisplayItems,
	};
}
