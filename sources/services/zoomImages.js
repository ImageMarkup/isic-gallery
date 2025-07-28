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
 */

/**
 * Creates and initializes an OpenLayers View with zoom functionality for the given HTML element
 * Works with jpg/png/tif formats
 * @param {HTMLElement} htmlElement with isic_id attribute
 * @returns {Promise<OlView|null>}
 */
export async function createZoomableImageView(htmlElement) {
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
	// eslint-disable-next-line no-new
	new Map({
		target: htmlElement,
		layers: [layer],
		view: imageView,
		controls: [],
	});

	imageView.fit(extent);
	const [minX, minY, maxX, maxY] = extent;
	const width = maxX - minX;
	const height = maxY - minY;
	// Need to set width or height because the map container's width or height are automatically 0
	setImageContainerSize(htmlElement, width, height);

	return imageView;
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
 * @param {OlView} imageView
 * @param {boolean} isZoomIn
 * @returns {void}
 */
export function zoomImage(imageView, isZoomIn) {
	if (!imageView) return;

	const zoom = imageView.getZoom() ?? imageView.getMinZoom();
	const newZoom = isZoomIn ? zoom + 1 : zoom - 1;

	imageView.animate({zoom: newZoom, duration: 250});
}
