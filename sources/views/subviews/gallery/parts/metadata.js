import "../../../components/templateWithImages";

const HEADER_HEIGHT = 28;

let scrollviewId;

/**
 * @param {Object} data
 * @returns {Array}
 */
function createAccordionItems(data) {
	const {acquisition, clinical} = data.metadata;
	return [
		{
			rows: [
				createAccordionItem("ACQUISITION INFORMATION", createRows(acquisition)),
				createAccordionItem("CLINICAL INFORMATION", createRows(clinical))
			]
		},
		createAccordionItem("TAGS", createTagsRow(data.notes?.tags)),
		createAccordionItem("INFO", createRows({
			"Unique ID": data.isic_id,
			"Copyright license": data.copyright_license
		}, false))
	];
}

/**
 * @param {string} header
 * @param {string} rows
 * @returns {Object}
 */
function createAccordionItem(header, rows) {
	return {
		header,
		css: "accordion-item-pale",
		headerAltHeight: HEADER_HEIGHT,
		headerHeight: HEADER_HEIGHT,
		body: {
			view: "template",
			template: `<div class="accordion-item-template">
							<div class="item-content-block">
								${rows}
							</div>
						</div>`,
			autoheight: true,
			borderless: true
		}
	};
}

/**
 * @param {Object} data
 * @param {boolean} [sort=true]
 * @returns {string}
 */
function createRows(data, sort = true) {
	if (!data || Object.keys(data).length === 0) {
		return "";
	}

	const keys = Object.keys(data);
	if (sort) {
		keys.sort();
	}

	return keys
		.map(key => createRow(key, data[key]))
		.join("");
}

/**
 * @param {string} label
 * @param {string | number | boolean} value
 * @returns {string}
 */
function createRow(label, value) {
	return `<div class="item-content-row">
				<div class="item-content-label">${label}</div>
				<div class="item-content-value">${value.toString() || ""}</div>
			</div>`;
}

/**
 * @param {Array} tags
 * @returns {string}
 */
function createTagsRow(tags) {
	if (!tags || tags.length === 0) {
		return "";
	}
	const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join("");
	return `<div class="item-content-row">
				<div class="tags-container">
					${tagsHtml}
				</div>
			</div>`;
}

function createConfig(data) {
	return {
		css: "metadata-scrollview",
		view: "scrollview",
		body: {
			// if true, we can use child components by id only
			// like this: $$("isolateComponentId").$$("childComponemtId")
			isolate: true,
			rows: [
				{
					css: "metadata-layout-image-name main-subtitle3",
					template: data.isic_id,
					height: 40,
					borderless: true
				},
				{
					view: "accordion",
					collapsed: false,
					type: "clean",
					borderless: true,
					multi: true,
					rows: createAccordionItems(data)
				}
			]
		}
	};
}

function getConfig(id, data) {
	let resultConfig = {};
	if (data) {
		resultConfig = createConfig(data);
	}
	resultConfig.id = id || `metadata-${webix.uid()}`;
	scrollviewId = resultConfig.id;
	resultConfig.body.id = `isolate-layout-${webix.uid()}`;
	return resultConfig;
}

function getIdFromConfig() {
	return scrollviewId;
}

export default {
	getConfig,
	getIdFromConfig
};
