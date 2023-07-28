import {JetView} from "webix-jet";

import constants from "../../../constants";
import ApiDocumentationService from "../../../services/apiDocumentation/apiDocumentation";
import annotationsDetailsHTML from "./htmlTemplate/annotations/annotationsDetails.html";
import annotationsDownloadHTML from "./htmlTemplate/annotations/annotationsDownload.html";
import annotationsListHTML from "./htmlTemplate/annotations/annotationsList.html";
import authenticationHTML from "./htmlTemplate/authentication.html";
import RAuthenticationHTML from "./htmlTemplate/codeSamples/R/RAuthentication.html";
import RSuperpixelsHTML from "./htmlTemplate/codeSamples/R/RSuperpixels.html";
import RAnnotationsDetailsHTML from "./htmlTemplate/codeSamples/R/annotations/RAnnotationsDetails.html";
import RAnnotationsDownloadHTML from "./htmlTemplate/codeSamples/R/annotations/RAnnotationsDownload.html";
import RAnnotationsListHTML from "./htmlTemplate/codeSamples/R/annotations/RAnnotationsList.html";
import RImagesDetailsHTML from "./htmlTemplate/codeSamples/R/images/RImagesDetails.html";
import RImagesDownloadHTML from "./htmlTemplate/codeSamples/R/images/RImagesDownload.html";
import RImagesListHTML from "./htmlTemplate/codeSamples/R/images/RImagesList.html";
import RSegmentationsDetailsHTML from "./htmlTemplate/codeSamples/R/segmentation/RSegmentationDetails.html";
import RSegmentationsDownloadHTML from "./htmlTemplate/codeSamples/R/segmentation/RSegmentationDownload.html";
import RSegmentationsListHTML from "./htmlTemplate/codeSamples/R/segmentation/RSegmentationsList.html";
import RStudiesDetailsHTML from "./htmlTemplate/codeSamples/R/studies/RStudiesDetails.html";
import RStudiesListHTML from "./htmlTemplate/codeSamples/R/studies/RStudiesList.html";
import pythonAnnotationsDetailsHTML from "./htmlTemplate/codeSamples/python/annotations/pythonAnnotationsDetails.html";
import pythonAnnotationsDownloadHTML from "./htmlTemplate/codeSamples/python/annotations/pythonAnnotationsDownload.html";
import pythonAnnotationsListHTML from "./htmlTemplate/codeSamples/python/annotations/pythonAnnotationsList.html";
import pythonImagesDetailsHTML from "./htmlTemplate/codeSamples/python/images/pythonImagesDetails.html";
import pythonImagesDownloadHTML from "./htmlTemplate/codeSamples/python/images/pythonImagesDownload.html";
import pythonImagesListHTML from "./htmlTemplate/codeSamples/python/images/pythonImagesList.html";
import pythonAuthenticationHTML from "./htmlTemplate/codeSamples/python/pythonAuthentication.html";
import pythonSuperpixelsHTML from "./htmlTemplate/codeSamples/python/pythonSuperpixels.html";
import pythonSegmentationsDetailsHTML from "./htmlTemplate/codeSamples/python/segmentation/pythonSegmentationDetails.html";
import pythonSegmentationsDownloadHTML from "./htmlTemplate/codeSamples/python/segmentation/pythonSegmentationDownload.html";
import pythonSegmentationsListHTML from "./htmlTemplate/codeSamples/python/segmentation/pythonSegmentationsList.html";
import pythonStudiesDetailsHTML from "./htmlTemplate/codeSamples/python/studies/pythonStudiesDetails.html";
import pythonStudiesListHTML from "./htmlTemplate/codeSamples/python/studies/pythonStudiesList.html";
import imagesDetailsHTML from "./htmlTemplate/images/imagesDetails.html";
import imagesDownloadHTML from "./htmlTemplate/images/imagesDownload.html";
import imagesListHTML from "./htmlTemplate/images/imagesList.html";
import isicArchiveHTML from "./htmlTemplate/isicArchive.html";
import librariesHTML from "./htmlTemplate/libraries.html";
import segmentationsDetailsHTML from "./htmlTemplate/segmentation/segmentationDetails.html";
import segmentationsDownloadHTML from "./htmlTemplate/segmentation/segmentationDownload.html";
import segmentationsListHTML from "./htmlTemplate/segmentation/segmentationsList.html";
import studiesDetailsHTML from "./htmlTemplate/studies/studiesDetails.html";
import studiesListHTML from "./htmlTemplate/studies/studiesList.html";
import superpixelsHTML from "./htmlTemplate/superpixels.html";
import terminologyHTML from "./htmlTemplate/terminology.html";

export default class APIDocumentationPage extends JetView {
	config() {
		let isicArchiveTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;"},
			template: () => isicArchiveHTML
		};

		let terminologyTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;"},
			template: () => terminologyHTML
		};

		let librariesTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;"},
			template: () => librariesHTML
		};

		let authenticationTemplate = {
			view: "template",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => authenticationHTML
		};

		let imagesListTemplate = {
			view: "template",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => imagesListHTML
		};
		let imagesDetailsTemplate = {
			view: "template",
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => imagesDetailsHTML
		};
		let imagesDownloadTemplate = {
			view: "template",
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => imagesDownloadHTML
		};

		let studiesListTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;"},
			template: () => studiesListHTML
		};

		let studiesDetailsTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			template: () => studiesDetailsHTML
		};

		let superpixelsTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;"},
			template: () => superpixelsHTML
		};

		let segmentationsListTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;"},
			template: () => segmentationsListHTML
		};

		let segmentationsDetailsTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			template: () => segmentationsDetailsHTML
		};

		let segmentationsDownloadTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			template: () => segmentationsDownloadHTML
		};

		let annotationsListTemplate = {
			view: "template",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => annotationsListHTML
		};

		let annotationsDetailsTemplate = {
			view: "template",
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => annotationsDetailsHTML
		};

		let annotationsDownloadTemplate = {
			view: "template",
			css: {"border-width": "0px !important;", background: "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => annotationsDownloadHTML
		};

		let pythonAuthentication = {
			view: "template",
			name: "python-1",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonAuthenticationHTML
		};

		let pythonImagesList = {
			view: "template",
			name: "python-2",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonImagesListHTML
		};
		let pythonImagesDetails = {
			view: "template",
			name: "python-3",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonImagesDetailsHTML
		};
		let pythonImagesDownload = {
			view: "template",
			name: "python-4",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonImagesDownloadHTML
		};

		let pythonStudiesList = {
			view: "template",
			name: "python-5",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonStudiesListHTML
		};

		let pythonStudiesDetails = {
			view: "template",
			name: "python-6",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonStudiesDetailsHTML
		};

		let pythonSuperpixels = {
			view: "template",
			name: "python-7",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonSuperpixelsHTML
		};

		let pythonSegmentationsList = {
			view: "template",
			name: "python-8",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonSegmentationsListHTML
		};

		let pythonSegmentationsDetails = {
			view: "template",
			name: "python-9",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonSegmentationsDetailsHTML
		};

		let pythonSegmentationsDownload = {
			view: "template",
			name: "python-10",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonSegmentationsDownloadHTML
		};

		let pythonAnnotationsList = {
			view: "template",
			name: "python-11",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonAnnotationsListHTML
		};

		let pythonAnnotationsDetails = {
			view: "template",
			name: "python-12",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonAnnotationsDetailsHTML
		};

		let pythonAnnotationsDownload = {
			view: "template",
			name: "python-13",
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => pythonAnnotationsDownloadHTML
		};

		let RAuthentication = {
			view: "template",
			name: "R-1",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RAuthenticationHTML
		};

		let RImagesList = {
			view: "template",
			name: "R-2",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RImagesListHTML
		};
		let RImagesDetails = {
			view: "template",
			name: "R-3",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RImagesDetailsHTML
		};
		let RImagesDownload = {
			view: "template",
			name: "R-4",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RImagesDownloadHTML
		};

		let RStudiesList = {
			view: "template",
			name: "R-5",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RStudiesListHTML
		};

		let RStudiesDetails = {
			view: "template",
			name: "R-6",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RStudiesDetailsHTML
		};


		let RSuperpixels = {
			view: "template",
			name: "R-7",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RSuperpixelsHTML
		};

		let RSegmentationsList = {
			view: "template",
			name: "R-8",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RSegmentationsListHTML
		};

		let RSegmentationsDetails = {
			view: "template",
			name: "R-9",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RSegmentationsDetailsHTML
		};

		let RSegmentationsDownload = {
			view: "template",
			name: "R-10",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RSegmentationsDownloadHTML
		};

		let RAnnotationsList = {
			view: "template",
			name: "R-11",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RAnnotationsListHTML
		};

		let RAnnotationsDetails = {
			view: "template",
			name: "R-12",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RAnnotationsDetailsHTML
		};

		let RAnnotationsDownload = {
			view: "template",
			name: "R-13",
			hidden: true,
			css: {"border-width": "0px !important;"},
			autoheight: true,
			template: () => RAnnotationsDownloadHTML
		};

		const langagugeMenu = {
			view: "menu",
			layout: "x",
			// menu data
			data: [
				{id: constants.PYTHON_MENU_ID, value: "Python", width: 40},
				{id: constants.R_MENU_ID, value: "R", width: 20}
			],
			type: {
				height: 30
			}
		};

		const leftSideBar = {
			view: "sidebar",
			css: "left-side-bar",
			borderless: true,
			width: 230,
			data: [
				{name: constants.ISIC_ARCHIVE_API_ID, value: "ISIC Archive API Documentation"},
				{name: constants.TERMINOLOGY_ID, value: "Terminology"},
				{name: constants.LIBRARIES_ID, value: "Libraries"},
				{name: constants.AUTHENTICATION_ID, value: "Authentication"},
				{value: "Images",
					data: [
						{name: constants.IMAGES_ID, value: "Get List of Images"},
						{name: constants.DETAILS_IMAGES_ID, value: "Get Details/Metadata for Images"},
						{name: constants.DOWNLOAD_IMAGES_ID, value: "Download Images"}
					]},
				{value: "Studies",
					data: [
						{name: constants.STUDIES_ID, value: "Get List of Studies"},
						{name: constants.DETAILS_STUDY_ID, value: "Get Details for Study"}
					]},
				{value: "Superpixels",
					data: [
						{name: constants.SUPERPIXELS_ID, value: "Download Superpixels Masks"}
					]},
				{value: "Segmentations",
					data: [
						{name: constants.SEGMENTATIONS_ID, value: "Get List of Segmentations"},
						{name: constants.DETAILS_SEGMENTATIONS_ID, value: "Get Details for a Segmentations"},
						{name: constants.DOWNLOAD_SEGMENTATIONS_ID, value: "Download Segmentation Mask"}
					]},
				{value: "Annotations",
					data: [
						{name: constants.ANNOTATIONS_ID, value: "Get List of Annotations"},
						{name: constants.DETAILS_ANNOTATIONS_ID, value: "Get Details of Annotations"},
						{name: constants.DOWNLOAD_ANNOTATIONS_ID, value: "Download Annotation Mask"}
					]}
			]
		};

		const listOfSearchedValues = {
			view: "list",
			name: "listOfSearchedValuesName",
			height: 238,
			hidden: true,
			scroll: false,
			css: "left-searched-list",
			borderless: true,
			template: (obj) => {
				if (obj.value) {
					return `<span>${obj.value}</span>`;
				}
				return obj.errorMessage;
			}
		};

		const searchInput = {
			view: "text",
			css: "text-field",
			name: "searchInputName",
			placeholder: "Search"
		};

		const isicLogoTemplate = {
			view: "template",
			autoheight: true,
			css: "logo-template",
			template: () => "<img src='sources/images/inner-pages/apiDocumentationLogo.png' class='logo'>"
		};

		const leftPanel = {
			name: "leftPanelName",
			css: "api-documentation-left-panel",
			width: 240,
			rows: [
				isicLogoTemplate,
				searchInput,
				listOfSearchedValues,
				leftSideBar,
				{height: 12}
			]
		};

		const scrollView = {
			view: "scrollview",
			borderless: true,
			scroll: "y",
			body: {
				rows: [
					{
						id: constants.ISIC_ARCHIVE_API_ID,
						cols: [
							isicArchiveTemplate,
							{
								rows: [
									{
										css: "language-menu",
										cols: [
											langagugeMenu
										]
									},
									{height: 70},
									{
										borderless: true,
										template: `<center>Scroll down for code samples, example requests and responses.
														<br>Select a language for code samples from the tabs above.</center>`
									}
								]
							}
						]
					},
					{
						id: constants.TERMINOLOGY_ID,
						cols: [
							terminologyTemplate,
							{}
						]
					},
					{
						id: constants.LIBRARIES_ID,
						cols: [
							librariesTemplate,
							{}
						]
					},
					{
						id: constants.AUTHENTICATION_ID,
						css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
						cols: [
							authenticationTemplate,
							{
								cols: [
									pythonAuthentication,
									RAuthentication
								]
							}
						]
					},
					{
						rows: [
							{
								id: constants.IMAGES_ID,
								css: {"border-top": "1px solid #ccc;"},
								cols: [
									imagesListTemplate,
									{
										cols: [
											pythonImagesList,
											RImagesList
										]
									}

								]
							},
							{
								id: constants.DETAILS_IMAGES_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									imagesDetailsTemplate,
									{
										cols: [
											pythonImagesDetails,
											RImagesDetails
										]
									}
								]
							},
							{
								id: constants.DOWNLOAD_IMAGES_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									imagesDownloadTemplate,
									{
										cols: [
											pythonImagesDownload,
											RImagesDownload
										]
									}
								]
							}
						]
					},
					{
						rows: [
							{
								id: constants.STUDIES_ID,
								css: {"border-top": "1px solid #ccc;"},
								cols: [
									studiesListTemplate,
									{
										cols: [
											pythonStudiesList,
											RStudiesList
										]
									}
								]
							},
							{
								id: constants.DETAILS_STUDY_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									studiesDetailsTemplate,
									{
										cols: [
											pythonStudiesDetails,
											RStudiesDetails
										]
									}
								]
							}
						]
					},
					{
						id: constants.SUPERPIXELS_ID,
						css: {"border-top": "1px solid #ccc;"},
						cols: [
							superpixelsTemplate,
							{
								cols: [
									pythonSuperpixels,
									RSuperpixels
								]
							}
						]
					},
					{
						rows: [
							{
								id: constants.SEGMENTATIONS_ID,
								css: {"border-top": "1px solid #ccc;"},
								cols: [
									segmentationsListTemplate,
									{
										cols: [
											pythonSegmentationsList,
											RSegmentationsList
										]
									}
								]
							},
							{
								id: constants.DETAILS_SEGMENTATIONS_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									segmentationsDetailsTemplate,
									{
										cols: [
											pythonSegmentationsDetails,
											RSegmentationsDetails
										]
									}
								]
							},
							{
								id: constants.DOWNLOAD_SEGMENTATIONS_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									segmentationsDownloadTemplate,
									{
										cols: [
											pythonSegmentationsDownload,
											RSegmentationsDownload
										]
									}
								]
							}
						]
					},
					{
						rows: [
							{
								id: constants.ANNOTATIONS_ID,
								css: {"border-top": "1px solid #ccc;"},
								cols: [
									annotationsListTemplate,
									{
										cols: [
											pythonAnnotationsList,
											RAnnotationsList
										]
									}
								]
							},
							{
								id: constants.DETAILS_ANNOTATIONS_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									annotationsDetailsTemplate,
									{
										cols: [
											pythonAnnotationsDetails,
											RAnnotationsDetails
										]
									}
								]
							},
							{
								id: constants.DOWNLOAD_ANNOTATIONS_ID,
								css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
								cols: [
									annotationsDownloadTemplate,
									{
										cols: [
											pythonAnnotationsDownload,
											RAnnotationsDownload
										]
									}
								]
							}
						]
					}
				]
			}
		};

		return {
			paddingY: 1,
			cols: [
				leftPanel,
				scrollView
			]
		};
	}

	ready() {
		const view = this.getRoot();
		const languageMenu = this.getLanguageMenu();
		const leftSidebar = this.getLeftSideBar();
		const pageScrollView = this.getPageScrollView();
		const listOfSearchedValues = this.getListOfSearchedValues();
		const searchInput = this.getSearchInput();
		this._apiDocumentationService = new ApiDocumentationService(
			view,
			languageMenu,
			leftSidebar,
			pageScrollView,
			searchInput,
			listOfSearchedValues
		);
		webix.extend(listOfSearchedValues, webix.OverlayBox);
	}

	urlChange() {
		this.app.callEvent("needSelectHeaderItem", [{itemName: constants.ID_HEADER_MENU_DOWNLOAD}]);
	}

	getListOfSearchedValues() {
		return this.getRoot().queryView({name: "listOfSearchedValuesName"});
	}

	getSearchInput() {
		return this.getRoot().queryView({name: "searchInputName"});
	}

	getLanguageMenu() {
		return this.getRoot().queryView({view: "menu"});
	}

	getLeftSideBar() {
		return this.getRoot().queryView({view: "sidebar"});
	}

	getPageScrollView() {
		return this.getRoot().queryView({view: "scrollview"});
	}

	getLanguageTemplates(languageName) {
		let languageTemplates = [];
		let index = 1;
		const maxLanguageTempaltes = 13;
		for (index; index <= maxLanguageTempaltes; index++) {
			let lagnuageTemplate = this.getRoot().queryView({name: `${languageName}-${index}`});
			languageTemplates.push(lagnuageTemplate);
		}
		return languageTemplates;
	}
}
