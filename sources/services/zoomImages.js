import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/WebGLTile";
import GeoTIFF from "ol/source/GeoTIFF";
import ImageStatic from "ol/source/ImageStatic";

import galleryImagesUrls from "app-models/galleryImagesUrls";

import util from "../utils/util";

const MOBILE_PORTRAIT_SIZE = "90vw";
const MOBILE_LANDSCAPE_SIZE = "90vh";
const DESKTOP_SIZE = "100%";

/**
 * @typedef {import("ol/View").default} OlView
 * @typedef {import("ol/Map").default} OlMap
 */

/**
 * @typedef {Object} ZoomableImageProperties
 * @property {OlView} view
 * @property {OlMap} map
 * @property {Array<number>} defaultExtent
 */

/**
 * Creates and initializes an OpenLayers View with zoom functionality for the given HTML element
 * Works with jpg/png/tif formats
 * @param {HTMLElement} htmlElement with isic_id attribute
 * @returns {Promise<ZoomableImageProperties|null>}
 */
export async function createZoomableImage(htmlElement) {
	const imageUrl = galleryImagesUrls.getNormalImageUrl(htmlElement?.getAttribute("isic_id"));
	if (!htmlElement || !imageUrl) return null;

	const imageUrlLowerCase = imageUrl.toLowerCase();
	const isTifImage = imageUrlLowerCase.endsWith(".tif") || imageUrlLowerCase.endsWith(".tiff");

	let extent;
	let layer;
	if (isTifImage) {
		const source = new GeoTIFF({sources: [{url: imageUrl}]});
		const sourceView = await source.getView();
		extent = sourceView.extent;
		layer = new TileLayer({source});
	}
	else {
		const loadImage = url => new Promise((resolve, reject) => {
			const img = new Image();
			img.src = url;
			img.onload = () => resolve(img);
			img.onerror = reject;
		});

		const img = await loadImage(imageUrl);
		extent = [0, 0, img.width, img.height];

		const source = new ImageStatic({
			url: imageUrl,
			imageExtent: extent,
		});
		layer = new ImageLayer({source});
	}

	const imageView = new View({extent});
	const imageMap = new Map({
		target: htmlElement,
		layers: [layer],
		view: imageView,
		controls: [],
	});

	const zoomableImageProperties = {
		view: imageView,
		map: imageMap,
		defaultExtent: extent,
	};

	setImageViewExtent(zoomableImageProperties, htmlElement, extent);
	attachResizeObserver(htmlElement, zoomableImageProperties);

	return zoomableImageProperties;
}

/**
 * Resizes image element and restores image view extent when parent element resizes
 * @param {HTMLElement} htmlElement
 * @param {ZoomableImageProperties} properties
 * @returns {void}
 */
function attachResizeObserver(htmlElement, properties) {
	let previousExtent = properties.defaultExtent;
	properties.view.on("change", () => {
		previousExtent = properties.view.calculateExtent(properties.map.getSize());
	});

	const resizeObserver = new ResizeObserver(() => {
		setImageViewExtent(properties, htmlElement, previousExtent);
	});
	resizeObserver.observe(htmlElement.parentElement);
}

/**
 * @param {ZoomableImageProperties} properties
 * @param {HTMLElement} htmlElement
 * @param {Array<number>} extent
 * @returns {void}
 */
function setImageViewExtent(properties, htmlElement, extent) {
	const [minX, minY, maxX, maxY] = properties.defaultExtent;
	const width = maxX - minX;
	const height = maxY - minY;
	setImageContainerSize(htmlElement, width, height);
	properties.map.updateSize();
	properties.view.fit(extent, {size: properties.map.getSize()});
}

/**
 * @param {HTMLElement} container
 * @param {number} width
 * @param {number} height
 * @returns {void}
 */
function setImageContainerSize(container, width, height) {
	const parent = container.parentElement;
	if (!parent) return;

	const parentRect = parent.getBoundingClientRect();
	const imgAspectRatio = height / width;
	const parentAspectRatio = parentRect.height / parentRect.width;

	const mobileImageContainerSize = util.isPortrait() ? MOBILE_PORTRAIT_SIZE : MOBILE_LANDSCAPE_SIZE;
	const imageContainerSize = util.isMobilePhone() ? mobileImageContainerSize : DESKTOP_SIZE;

	if (parentAspectRatio > imgAspectRatio) {
		container.style.width = imageContainerSize;
		container.style.height = "auto";
	}
	else {
		container.style.height = imageContainerSize;
		container.style.width = "auto";
	}
	container.style.aspectRatio = `${width} / ${height}`;
}

/**
 * @param {ZoomableImageProperties} properties
 * @param {boolean} isZoomIn
 * @returns {void}
 */
export function zoomImage(properties, isZoomIn) {
	const imageView = properties.view;
	if (!imageView) return;

	const minZoom = imageView.getMinZoom();
	const maxZoom = imageView.getMaxZoom();
	const zoom = imageView.getZoom() ?? minZoom;
	const newZoom = isZoomIn ? Math.min(zoom + 0.5, maxZoom) : Math.max(zoom - 0.5, minZoom);
	const newCenter = getAdjustedCenter(properties, newZoom);

	imageView.animate({zoom: newZoom, center: newCenter, duration: 250});
}

/**
 * @param {ZoomableImageProperties} properties
 * @param {number} newZoom
 * @returns {Array<number>}
 */
function getAdjustedCenter(properties, newZoom) {
	const mapSize = properties.map.getSize();
	const resolution = properties.view.getResolutionForZoom(newZoom);
	const visibleWidth = mapSize[0] * resolution;
	const visibleHeight = mapSize[1] * resolution;

	const [minX, minY, maxX, maxY] = properties.defaultExtent;
	const imageWidth = maxX - minX;
	const imageHeight = maxY - minY;
	const imageCenterX = (minX + maxX) / 2;
	const imageCenterY = (minY + maxY) / 2;

	const minCenterX = minX + visibleWidth / 2;
	const maxCenterX = maxX - visibleWidth / 2;
	const minCenterY = minY + visibleHeight / 2;
	const maxCenterY = maxY - visibleHeight / 2;

	const currentCenter = properties.view.getCenter();
	const newCenterX = imageWidth <= visibleWidth
		? imageCenterX
		: Math.min(Math.max(currentCenter[0], minCenterX), maxCenterX);
	const newCenterY = imageHeight <= visibleHeight
		? imageCenterY
		: Math.min(Math.max(currentCenter[1], minCenterY), maxCenterY);

	return [newCenterX, newCenterY];
}
