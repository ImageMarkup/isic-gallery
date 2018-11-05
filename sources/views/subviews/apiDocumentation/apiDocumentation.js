import {JetView} from "webix-jet";
import isicArchiveHTML from "./htmlTemplate/isicArchive.html";
import terminologyHTML from "./htmlTemplate/terminology.html";
import librariesHTML from "./htmlTemplate/libraries.html";
import authenticationHTML from "./htmlTemplate/authentication.html";

import imagesListHTML from "./htmlTemplate/images/imagesList.html";
import imagesDetailsHTML from "./htmlTemplate/images/imagesDetails.html";
import imagesDownloadHTML from "./htmlTemplate/images/imagesDownload.html";

import studiesListHTML from "./htmlTemplate/studies/studiesList.html";
import studiesDetailsHTML from "./htmlTemplate/studies/studiesDetails.html";

import superpixelsHTML from "./htmlTemplate/superpixels.html";

import segmentationsListHTML from "./htmlTemplate/segmentation/segmentationsList.html";
import segmentationsDetailsHTML from "./htmlTemplate/segmentation/segmentationDetails.html";
import segmentationsDownloadHTML from "./htmlTemplate/segmentation/segmentationDownload.html";

import annotationsListHTML from "./htmlTemplate/annotations/annotationsList.html";
import annotationsDetailsHTML from "./htmlTemplate/annotations/annotationsDetails.html";
import annotationsDownloadHTML from "./htmlTemplate/annotations/annotationsDownload.html";

import pythonAuthenticationHTML from "./htmlTemplate/codeSamples/python/pythonAuthentication.html";

import pythonImagesListHTML from "./htmlTemplate/codeSamples/python/images/pythonImagesList.html";
import pythonImagesDetailsHTML from "./htmlTemplate/codeSamples/python/images/pythonImagesDetails.html";
import pythonImagesDownloadHTML from "./htmlTemplate/codeSamples/python/images/pythonImagesDownload.html";

import pythonStudiesListHTML from "./htmlTemplate/codeSamples/python/studies/pythonStudiesList.html";
import pythonStudiesDetailsHTML from "./htmlTemplate/codeSamples/python/studies/pythonStudiesDetails.html";

import pythonSuperpixelsHTML from "./htmlTemplate/codeSamples/python/pythonSuperpixels.html";

import pythonSegmentationsListHTML from "./htmlTemplate/codeSamples/python/segmentation/pythonSegmentationsList.html";
import pythonSegmentationsDetailsHTML from "./htmlTemplate/codeSamples/python/segmentation/pythonSegmentationDetails.html";
import pythonSegmentationsDownloadHTML from "./htmlTemplate/codeSamples/python/segmentation/pythonSegmentationDownload.html";

import pythonAnnotationsListHTML from "./htmlTemplate/codeSamples/python/annotations/pythonAnnotationsList.html";
import pythonAnnotationsDetailsHTML from "./htmlTemplate/codeSamples/python/annotations/pythonAnnotationsDetails.html";
import pythonAnnotationsDownloadHTML from "./htmlTemplate/codeSamples/python/annotations/pythonAnnotationsDownload.html";

export default class APIDocumentationPage extends JetView {
	config() {
		let isicArchiveTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;"},
			template: () => {
				return isicArchiveHTML;
			}
		};

		let terminologyTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;"},
			template: () => {
				return terminologyHTML;
			}
		};

		let librariesTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;"},
			template: () => {
				return librariesHTML;
			}
		};

		let authenticationTemplate = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return authenticationHTML;
			}
		};

		let imagesListTemplate = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return imagesListHTML;
			}
		};
		let imagesDetailsTemplate = {
			view: "template",
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => {
				return imagesDetailsHTML;
			}
		};
		let imagesDownloadTemplate = {
			view: "template",
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => {
				return imagesDownloadHTML;
			}
		};

		let studiesListTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;"},
			template: () => {
				return studiesListHTML;
			}
		};

		let studiesDetailsTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			template: () => {
				return studiesDetailsHTML;
			}
		};

		let superpixelsTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;"},
			template: () => {
				return superpixelsHTML;
			}
		};

		let segmentationsListTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;"},
			template: () => {
				return segmentationsListHTML;
			}
		};

		let segmentationsDetailsTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			template: () => {
				return segmentationsDetailsHTML;
			}
		};

		let segmentationsDownloadTemplate = {
			view: "template",
			autoheight: true,
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			template: () => {
				return segmentationsDownloadHTML;
			}
		};

		let annotationsListTemplate = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return annotationsListHTML;
			}
		};

		let annotationsDetailsTemplate = {
			view: "template",
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => {
				return annotationsDetailsHTML;
			}
		};

		let annotationsDownloadTemplate = {
			view: "template",
			css: {"border-width":"0px !important;", "background": "rgb(243, 247, 249) !important;"},
			autoheight: true,
			template: () => {
				return annotationsDownloadHTML;
			}
		};

		let pythonAuthentication = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonAuthenticationHTML;
			}
		};

		let pythonImagesList = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonImagesListHTML;
			}
		};
		let pythonImagesDetails = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonImagesDetailsHTML;
			}
		};
		let pythonImagesDownload = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonImagesDownloadHTML;
			}
		};

		let pythonStudiesList = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonStudiesListHTML;
			}
		};

		let pythonStudiesDetails = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonStudiesDetailsHTML;
			}
		};



		let pythonSuperpixels = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonSuperpixelsHTML;
			}
		};

		let pythonSegmentationsList = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonSegmentationsListHTML;
			}
		};

		let pythonSegmentationsDetails = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonSegmentationsDetailsHTML;
			}
		};

		let pythonSegmentationsDownload = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonSegmentationsDownloadHTML;
			}
		};

		let pythonAnnotationsList = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonAnnotationsListHTML;
			}
		};

		let pythonAnnotationsDetails = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonAnnotationsDetailsHTML;
			}
		};

		let pythonAnnotationsDownload = {
			view: "template",
			css: {"border-width":"0px !important;"},
			autoheight: true,
			template: () => {
				return pythonAnnotationsDownloadHTML;
			}
		};

		const tabButtonPython = {
			view: "button",
			width: 50,
			height: 30,
			value: "Python"
		};

		const tabButtonR = {
			view: "button",
			width: 20,
			height: 30,
			value: "R"
		};

		return {
			paddingY: 1,
			cols: [
				{width: 230},
				{
					rows: [
						{
							cols: [
								isicArchiveTemplate,
								{
									rows: [
										{
											cols: [
												tabButtonPython,
												tabButtonR,
												{}
											]
										},
										{height: 70},
										{
											borderless: true,
											template: `<center><p>Scroll down for code samples, example requests and responses.</p>
												<p>Select a language for code samples from the tabs above or the mobile navigation menu.</p></center>`,
										}
									]
								}
							]
						},
						{
							cols: [
								terminologyTemplate,
								{}
							]
						},
						{
							cols: [
								librariesTemplate,
								{}
							]
						},
						{
							css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
							cols: [
								authenticationTemplate,
								pythonAuthentication
							]
						},
						{
							rows: [
								{
									css: {"border-top": "1px solid #ccc;"},
									cols: [
										imagesListTemplate,
										pythonImagesList
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										imagesDetailsTemplate,
										pythonImagesDetails
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										imagesDownloadTemplate,
										pythonImagesDownload
									]
								},
							]
						},
						{
							rows: [
								{
									css: {"border-top": "1px solid #ccc;"},
									cols: [
										studiesListTemplate,
										pythonStudiesList
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										studiesDetailsTemplate,
										pythonStudiesDetails
									]
								}
							]
						},
						{
							css: {"border-top": "1px solid #ccc;"},
							cols: [
								superpixelsTemplate,
								pythonSuperpixels
							]
						},
						{
							rows: [
								{
									css: {"border-top": "1px solid #ccc;"},
									cols: [
										segmentationsListTemplate,
										pythonSegmentationsList
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										segmentationsDetailsTemplate,
										pythonSegmentationsDetails
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										segmentationsDownloadTemplate,
										pythonSegmentationsDownload
									]
								}
							]
						},
						{
							rows: [
								{
									css: {"border-top": "1px solid #ccc;"},
									cols: [
										annotationsListTemplate,
										pythonAnnotationsList
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										annotationsDetailsTemplate,
										pythonAnnotationsDetails
									]
								},
								{
									css: {"border-top": "1px solid #ccc;", "margin-top": "-2px !important;"},
									cols: [
										annotationsDownloadTemplate,
										pythonAnnotationsDownload
									]
								}
							]
						}
					]
				}
			]
		}
	}
}