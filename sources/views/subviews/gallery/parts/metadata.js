import "../../../components/templateWithImages";

const HEADER_HEIGHT = 28;

let scrollviewId;


webix.protoUI({
	name: "metadataEditView"
}, webix.ui.scrollview);

function createEditForm(itemData, name) {
	let dataForElements = [];
	const keys = Object.keys(itemData);
	keys.forEach((key) => {
		if (key === "pixelsX" || key === "pixelsY") {
			return;
		}
		const element = {
			css: "text-field",
			view: "text",
			label: key,
			name: key,
			value: itemData[key],
			labelWidth: 190,
			on: {
				// To fix image switching by arrow buttons, when editting metadata
				onAfterRender() {
					function keyPressHandler(e) {
						webix.html.stopEvent(e);
					}
					const textNode = this.getNode();
					// remove old listeners if we have ones
					textNode.removeEventListener("keyup", keyPressHandler);
					textNode.removeEventListener("keydown", keyPressHandler);
					textNode.addEventListener("keyup", keyPressHandler);
					textNode.addEventListener("keydown", keyPressHandler);
				}
			}
		};
		dataForElements.push(element);
	});

	const view = {
		view: "form",
		name: `${name}-editFormName`,
		elements: dataForElements
	};
	return view;
}

function createTemplateRows(itemData) {
	let template = "";
	if (!itemData) {
		return template;
	}

	Object.keys(itemData).sort().forEach((key) => {
		template += `<div class="item-content-row">
					<div class="item-content-label">${key}</div>
					<div class="item-content-value">${itemData[key].toString() || ""}</div>
				</div>`;
	});

	return template;
}


function createTagsTemplate(data) {
	let template = "";
	if (!data) {
		return template;
	}
	data.forEach((value) => {
		template += `<span class="tag">${value}</span>`;
	});
	return `<div class="accordion-item-template">
				<div class="tags-container">
					${template}
				</div>
			</div>`;
}

function createTemplate(data) {
	return {
		rows: [
			{
				header: "ACQUISITION INFORMATION",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: {
					view: "template",

					template: `<div class="accordion-item-template">
								<div class="item-content-block">
									${createTemplateRows(data.metadata.acquisition)}
								</div>
							</div>`,
					autoheight: true,
					borderless: true
				}
			},
			{
				header: "CLINICAL INFORMATION",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: {
					view: "template",

					template: `<div class="accordion-item-template">
								<div class="item-content-block">
									${createTemplateRows(data.metadata.clinical)}
								</div>
							</div>`,
					autoheight: true,
					borderless: true
				}
			}
		]
	};
}

function createFormView(data) {
	return {
		name: "editFormName",
		rows: [
			{
				header: "CLINICAL INFORMATION",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: createEditForm(data.metadata, "clinical")
			}
		]
	};
}

function createMutliView(data) {
	let multiview = {
		name: "editViewsName",
		animate: false,
		cells: [
			createTemplate(data),
			createFormView(data)
		]
	};
	return multiview;
}

function createAccordionRows(data) {
	const multiView = createMutliView(data);
	return [
		multiView,
		{
			header: "TAGS",
			css: "accordion-item-pale",
			headerAltHeight: HEADER_HEIGHT,
			headerHeight: HEADER_HEIGHT,
			body: {
				view: "template",
				template: data.notes ? createTagsTemplate(data.notes.tags) : "",
				autoheight: true,
				borderless: true
			}
		},
		{
			header: "INFO",
			css: "accordion-item-pale",
			headerAltHeight: HEADER_HEIGHT,
			headerHeight: HEADER_HEIGHT,
			body: {
				view: "template",
				template: `	<div class="accordion-item-template">
								<div class="item-content-block">
									<div class="item-content-row">
										<div class="item-content-label">Unique ID</div>
										<div class="item-content-value">${data.isic_id || ""}</div>
									</div>
								</div>
							</div>`,
				autoheight: true,
				borderless: true
			}
		}
	];
}

function createConfig(data) {
	return {
		css: "metadata-scrollview",
		view: "metadataEditView",
		body: {
			// if true, we can use child components by id only
			// like this: $$("isolateComponentId").$$("childComponemtId")
			isolate: true,
			rows: [
				{
					cols: [
						{
							css: "metadata-layout-image-name main-subtitle3",
							template: data.isic_id,
							height: 40,
							borderless: true
						},
						{
							view: "button",
							type: "icon",
							icon: "fas fa-pencil-alt",
							width: 70,
							height: 30,
							label: "Edit",
							name: "editButtonName",
							hidden: true
						},
						{
							view: "button",
							type: "icon",
							width: 70,
							height: 30,
							icon: "far fa-save",
							label: "Save",
							name: "saveButtonName",
							hidden: true
						},
						{
							view: "button",
							type: "icon",
							width: 100,
							height: 30,
							icon: "fas fa-times",
							label: "Cancel",
							name: "cancelButtonName",
							hidden: true
						}

					]
				},
				{
					view: "accordion",
					collapsed: false,
					type: "clean",
					borderless: true,
					multi: true,
					rows: createAccordionRows(data)
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
