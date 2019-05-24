import datesHelper from "../../../../utils/formats";
import ajax from "../../../../services/ajaxActions";
import util from "../../../../utils/util";
import "../../../components/templateWithImages";
import auth from "../../../../services/auth";

const HEADER_HEIGHT = 28;
const SEGMENTATION_TEMPLATE_ID = "segmentation-template";

let scrollviewId;
let isolateLayoutId;
let imageObj;

webix.protoUI({
	name: "metadataEditView",
	$init() {
		this.$ready.push(this.custom_func);
	},
	custom_func() {
		const scrollView = $$(scrollviewId);
		const editButton = scrollView.queryView({name: "editButtonName"});
		const saveButton = scrollView.queryView({name: "saveButtonName"});
		const cancelButton = scrollView.queryView({name: "cancelButtonName"});
		const editForm = scrollView.queryView({name: "editFormName"});
		const editViews = scrollView.queryView({name: "editViewsName"});
		const clinicalForm = scrollView.queryView({name: "clinical-editFormName"});
		const acquisitionForm = scrollView.queryView({name: "acquisition-editFormName"});
		const clinicalInitialValues = clinicalForm.getValues();
		const acquisitInitialionValues = acquisitionForm.getValues();
		const window = scrollView.getTopParentView();

		// show button for study admin
		if (auth.isStudyAdmin()) {
			editButton.show();
		}

		editButton.attachEvent("onItemClick", () => {
			editButton.hide();
			saveButton.show();
			cancelButton.show();
			editForm.show();
		});
		saveButton.attachEvent("onItemClick", function () {
			const clinicalValues = clinicalForm.getValues();
			const acquisitionValues = acquisitionForm.getValues();
			const valuesToUpload = Object.assign(clinicalValues, acquisitionValues);
			ajax.postImageMetadata(imageObj._id, valuesToUpload)
				.then((data) => {
					const errorsArray = data.errors;
					if (errorsArray.length === 0) {
						this.hide();
						cancelButton.hide();
						editButton.show();
						editViews.back();
						window.hide();
						webix.message("Metadata has been edited successfully!");
					}
					else {
						const regexForTextName = /'.*?'/;
						const regexToReplace = /'/g;
						errorsArray.forEach((errorMessage) => {
							let errorField = errorMessage.description.match(regexForTextName)[0];
							errorField = errorField.replace(regexToReplace, "");
							let errorElement;
							if (errorField === "age") {
								errorElement = clinicalForm.elements.age_approx;
							}
							else if (errorField !== "image_type") {
								errorElement = clinicalForm.elements[errorField];
							}
							else {
								errorElement = acquisitionForm.elements[errorField];
							}
							util.changeInputNodeColor(errorElement);
							webix.message({
								text: errorMessage.description,
								expire: -1
							});
						});
					}
				}).fail(() => {
					webix.message("Something went wrong!");
				});
		});
		cancelButton.attachEvent("onItemClick", function () {
			clinicalForm.clear();
			acquisitionForm.clear();
			clinicalForm.setValues(clinicalInitialValues);
			acquisitionForm.setValues(acquisitInitialionValues);
			this.hide();
			saveButton.hide();
			editButton.show();
			editViews.back();
			webix.message.hideAll();
		});
	}

}, webix.ui.scrollview);

const segmentationSelect = {
	view: "richselect",
	css: "select-field",
	width: 290,
	placeholder: "Select Segmentations",
	options: {
		body: {
			template(obj) {
				return ` ${datesHelper.formatDateString(obj.created)} ${obj.skill}`;
			}
		}
	},
	on: {
		onChange(newv) {
			const segmentationTemplate = $$(isolateLayoutId).$$(SEGMENTATION_TEMPLATE_ID);
			const selectedItem = this.getList().getItem(newv);
			ajax.getSegmentationItem(selectedItem._id).then((data) => {
				$$(isolateLayoutId).$$(SEGMENTATION_TEMPLATE_ID).setValues(data);
				if (!segmentationTemplate.isVisible()) {
					segmentationTemplate.show();
				}
			});
		}
	}
};

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
			labelWidth: 190
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
	const keys = Object.keys(itemData);
	keys.forEach((key) => {
		template += `<div class="item-content-row">
						<div class="item-content-label">${key}</div>
						<div class="item-content-value">${itemData[key] || ""}</div>
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

function prepareReviewSkill(reviews) {
	let skill = "";
	if (reviews && reviews.length) {
		let latestReview;
		let latestDate;
		reviews.forEach((review) => {
			let currentReviewDate = new Date(review.time);
			if (!latestDate || currentReviewDate > latestDate) {
				latestDate = currentReviewDate;
				latestReview = review;
			}
		});
		skill = latestReview.skill;
	}
	return skill;
}

function createTemplate(data, acquisitionDynamicProps) {
	return {
		rows: [
			{
				header: "CLINICAL INFORMATION",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: {
					view: "template",

					template: `<div class="accordion-item-template">
								<div class="item-content-block">
									${createTemplateRows(data.meta.clinical)}
								</div>
							</div>`,
					autoheight: true,
					borderless: true
				}
			},
			{
				header: "ACQUISITION METADATA",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: {
					view: "template",
					template: `	<div class="accordion-item-template">
								<div class="item-content-block">
									<div class="item-content-row">
										<div class="item-content-label">Dimentions (pixels)</div>
										<div class="item-content-value">${data.meta.acquisition.pixelsX || ""} &#9747 ${data.meta.acquisition.pixelsY || ""}</div>
									</div>
									${createTemplateRows(acquisitionDynamicProps)}
								</div>
							</div>`,
					autoheight: true,
					borderless: true
				}
			},
			{
				header: "UNSTRUCTURED METADATA",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: {
					view: "template",
					name: "editTemplateName",
					template: `	<div class="accordion-item-template">
								<div class="item-content-block">
									${createTemplateRows(data.meta.unstructured)}
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
				body: createEditForm(data.meta.clinical, "clinical")
			},
			{
				header: "ACQUISITION METADATA",
				css: "accordion-item-pale",
				headerAltHeight: HEADER_HEIGHT,
				headerHeight: HEADER_HEIGHT,
				body: createEditForm(data.meta.acquisition, "acquisition")
			}
		]
	};
}

function createMutliView(data, acquisitionDynamicProps) {
	let multiview = {
		name: "editViewsName",
		animate: false,
		cells: [
			createTemplate(data, acquisitionDynamicProps),
			createFormView(data)
		]
	};
	return multiview;
}

function createAccordionRows(data) {
	let acquisitionDynamicProps;
	if (data.acquisition) {
		acquisitionDynamicProps = webix.copy(data.acquisition);
		delete acquisitionDynamicProps.pixelsX;
		delete acquisitionDynamicProps.pixelsY;
	}
	return [
		createMutliView(data, acquisitionDynamicProps),
		{
			header: "TAGS",
			css: "accordion-item-pale",
			headerAltHeight: HEADER_HEIGHT,
			headerHeight: HEADER_HEIGHT,
			body: {
				view: "template",
				template: createTagsTemplate(data.notes.tags),
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
										<div class="item-content-value">${data.dataset._id || ""}</div>
									</div>
									<div class="item-content-row">
										<div class="item-content-label">Dataset</div>
										<div class="item-content-value">${data.dataset.name || ""}</div>
									</div>
									<div class="item-content-row">
										<div class="item-content-label">Created</div>
										<div class="item-content-value">${data.dataset.updated || ""}</div>
									</div>
									<div class="item-content-row">
										<div class="item-content-label">License</div>
										<div class="item-content-value">${data.dataset.license || ""}</div>
									</div>
								</div>
							</div>`,
				autoheight: true,
				borderless: true
			}
		},
		{
			header: "SEGMENTATION",
			css: "accordion-item-pale",
			headerAltHeight: HEADER_HEIGHT,
			headerHeight: HEADER_HEIGHT,
			body: {
				rows: [
					{
						paddingY: 8,
						paddingX: 35,
						rows: [
							segmentationSelect
						]
					},
					{
						view: "templateWithImages",
						id: SEGMENTATION_TEMPLATE_ID,
						hidden: true,
						template(obj) {
							return `	<div class="accordion-item-template">
								<div class="item-content-block">
									<div class="item-content-row">
										<div class="item-content-label">Created</div>
										<div class="item-content-value">${obj.created ? datesHelper.formatDateString(obj.created) : ""}</div>
									</div>
									<div class="item-content-row">
										<div class="item-content-label">Creator</div>
										<div class="item-content-value">${obj.creator.name || ""}</div>
									</div>
									<div class="item-content-row">
										<div class="item-content-label">Review Skill</div>
										<div class="item-content-value">${prepareReviewSkill(obj.reviews)}</div>
									</div>
								</div>
								<div class="item-content-img"><img src="${ajax.getBaseApiUrl()}segmentation/${obj._id}/thumbnail?width=256"/></div>
								<div class="item-content-block"><div class="link segmentation-download">Download segmentation image</div></div>
							</div>`;
						},
						onClick: {
							"segmentation-download": function () {
								ajax.getSegmentationMask(this.data._id).then((blob) => {
									util.downloadBlob(blob, `${data.name}_segmentation.png`);
								});
							}
						},
						borderless: true,
						autoheight: true
					}

				]
			}
		}
	];
}

function createConfig(data) {
	segmentationSelect.options.body.data = webix.copy(data.segmentation);
	return {
		css: "metadata-scrollview",
		view: "metadataEditView",
		body: {
			isolate: true, // if true, we can use child components by id only like this: $$("isolateComponentId").$$("childComponemtId")
			rows: [
				{
					cols: [
						{
							css: "metadata-layout-image-name main-subtitle3",
							template: data.name,
							autoheight: true,
							borderless: true
						},
						{
							view: "button",
							type: "icon",
							icon: "pencil",
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
							icon: "floppy-o",
							label: "Save",
							name: "saveButtonName",
							hidden: true
						},
						{
							view: "button",
							type: "icon",
							width: 100,
							height: 30,
							icon: "times",
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

function getConfig(id, data, image) {
	let resultConfig = {};
	if (data) {
		resultConfig = createConfig(data);
	}
	resultConfig.id = id || `metadata-${webix.uid()}`;
	scrollviewId = resultConfig.id;
	resultConfig.body.id = `isolate-layout-${webix.uid()}`;
	isolateLayoutId = resultConfig.body.id;
	imageObj = image;
	return resultConfig;
}

function getIdFromConfig() {
	return scrollviewId;
}

export default {
	getConfig,
	getIdFromConfig
};
