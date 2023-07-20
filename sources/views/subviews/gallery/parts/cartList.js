import galleryImagesUrls from "../../../../models/galleryImagesUrls";
import util from "../../../../utils/util";

const ID_CART_LIST_PANEL = `cart-list-panel-id-${webix.uid()}`;
const ID_CART_LIST = `cart-list-id-${webix.uid()}`;
const ID_DOWNLOAD_SELECTED_IMAGES_BUTTON = `download-selected-images-button-id-${webix.uid()}`;
const NAME_CART_LIST = `cartListName-${webix.uid()}`;
const NAME_DOWNLOAD_SELECTED_IMAGES_BUTTON = `downloadSelectedImagesButtonName-${webix.uid()}`;

/**
 *
 * @param {Object} config
 * @param {string} config.cartListID - the id of cart list
 * @return {Object} - cart list configuration
 */
function getConfig(config) {
	const cartListID = config.cartListID;
	const cartList = {
		view: "list",
		css: "cart-list-view",
		id: ID_CART_LIST,
		name: NAME_CART_LIST,
		scroll: "auto",
		width: 180,
		template: (obj/* , common */) => {
			if (typeof galleryImagesUrls.getPreviewImageUrl(obj.isic_id) === "undefined") {
				galleryImagesUrls.setPreviewImageUrl(obj.isic_id, obj.files.thumbnail_256.url);
			}
			return `<div>
				<span class='webix_icon template-angle fas ${util.angleIconChange(obj)}' style="color: rgba(0, 0, 0, 0.8) !important;"></span>
				<div style='float: right'><span class="delicon fas fa-times" style="width: 25px; height: 25px"></span></div>
 				<div class='card-list-name'>${obj.isic_id}</div>
 				<img src="${galleryImagesUrls.getPreviewImageUrl(obj.isic_id) || ""}" class="cart-image">
			</div>`;},
		onClick: {
			delicon: (ev, id) => {
				$$(ID_CART_LIST).callEvent("onDeleteButtonClick", [id]);
			}
		}
	};
	const downloadZipButton = {
		view: "button",
		value: "Download ZIP",
		id: ID_DOWNLOAD_SELECTED_IMAGES_BUTTON,
		name: NAME_DOWNLOAD_SELECTED_IMAGES_BUTTON
	};
	return {
		id: cartListID,
		rows: [
			cartList,
			downloadZipButton
		]
	};
}

function getCartListID() {
	return ID_CART_LIST;
}

function getCartListName() {
	return NAME_CART_LIST;
}

function getDownloadSelectedImagesButtonName() {
	return NAME_DOWNLOAD_SELECTED_IMAGES_BUTTON;
}

export default {
	getConfig,
	getCartListName,
	getCartListID,
	getDownloadSelectedImagesButtonName
};
