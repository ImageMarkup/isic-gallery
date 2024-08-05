const lesionsMap = new Map();
let currentItem;
let leftMode;
let rightMode;
let leftImage;
let rightImage;
/** @type {webix.DataCollection} */
const currentLeftImagesCollection = new webix.DataCollection();
/** @type {webix.DataCollection} */
const currentRightImagesCollection = new webix.DataCollection();

function getLesionByID(lesionID) {
	return lesionsMap.get(lesionID);
}

function setLesions(lesions) {
	if (Array.isArray(lesions)) {
		lesions.push(...lesions);
	}
	lesions.forEach((l) => {
		lesionsMap.set(l.id, l);
	});
}

function getLesionImagesCount(lesionID) {
	const lesion = getLesionByID(lesionID);
	return lesion?.images_count ?? 0;
}

function getLesionAnchorImageID(lesionID) {
	const lesion = getLesionByID(lesionID);
	return lesion?.index_image_id;
}

function checkIsImageAnchor(image) {
	const lesionID = getItemLesionID(image);
	if (lesionID) {
		const lesionAnchorImageID = getAnchorImageID(lesionID);
		return lesionAnchorImageID === getItemID(image);
	}
	return false;
}

function getLesionModalitiesCount(lesionID) {
	const lesion = getLesionByID(lesionID);
	const images = lesion.images;
	const lesionModalitiesCount = images.reduce((modalities, img) => {
		const imgModality = getImageModality(img);
		if (modalities.includes(imgModality)) {
			return modalities;
		}
		modalities.push(imgModality);
		return modalities;
	}, [])?.length;
	return lesionModalitiesCount;
}

function getImagesWithModalityCount(item) {
	const lesionID = getItemLesionID(item);
	if (lesionID) {
		const lesion = getLesionByID(lesionID);
		const modality = getItemModality(item);
		const images = lesion.images;
		const lesionModalityImagesCount = images.filter(i => getImageModality(i) === modality).length;
		return lesionModalityImagesCount;
	}
	return 0;
}

function getLesionTimePoints(lesionID) {
	const lesion = getLesionByID(lesionID);
	const images = lesion?.images;
	const lesionTimePoints = images?.reduce((timePoints, img) => {
		const imgTimePoint = getImageTimePoint(img);
		if (timePoints.includes(imgTimePoint)) {
			return timePoints;
		}
		timePoints.push(imgTimePoint);
		return timePoints;
	}, []);
	return lesionTimePoints;
}

function getLesionTimePointsCount(lesionID) {
	const lesionTimePoints = getLesionTimePoints(lesionID);
	return lesionTimePoints.length;
}

function getImagesWithTimePointsCount(item) {
	const lesionID = getItemLesionID(item);
	if (lesionID) {
		const lesion = getLesionByID(lesionID);
		const timePoint = getItemTimePoint(item);
		const images = lesion?.images;
		const lesionTimePointsImagesCount = images
			.filter(i => getImageTimePoint(i) === timePoint).length;
		return lesionTimePointsImagesCount;
	}
	return 0;
}

function getLesionImages(lesionID) {
	const lesion = getLesionByID(lesionID);
	return lesion?.images;
}

function getModalityImages(lesionID, modality) {
	const lesionImages = getLesionImages(lesionID);
	return lesionImages?.filter(i => getImageModality(i) === modality);
}

function getTimePointImages(lesionID, timePoint) {
	const lesionImages = getLesionImages(lesionID);
	return lesionImages?.filter(i => getImageTimePoint(i) === timePoint);
}

// combine is time point and modality
function getCombineImages(lesionID, timePoint, modality) {
	const lesionImages = getLesionImages(lesionID);
	return lesionImages?.filter((i) => {
		const result = getImageTimePoint(i) === timePoint && getImageModality(i) === modality;
		return result;
	});
}

function getAnchorImageID(lesionID) {
	const lesion = getLesionByID(lesionID);
	return lesion?.index_image_id;
}

function getFirstNonAnchorImage(lesionID, anchorImageID) {
	const timePoints = getLesionTimePoints(lesionID);
	const lesionImages = getLesionImages(lesionID);
	const anchorImage = lesionImages.find(i => getItemID(i) === anchorImageID);
	const anchorTimePoint = getImageTimePoint(anchorImage);
	const sortedTimePoints = timePoints.sort((a, b) => a - b);
	const firstTimePoint = sortedTimePoints[0];
	let nonAnchorImage;
	if (timePoints.length === 1) {
		nonAnchorImage = lesionImages.find(i => anchorImageID !== getItemID(i))
			?? lesionImages[0];
	}
	else if (anchorTimePoint === firstTimePoint) {
		const secondTimePoint = sortedTimePoints[1];
		nonAnchorImage = lesionImages.find(i => getImageTimePoint(i) === secondTimePoint);
	}
	else {
		nonAnchorImage = lesionImages.find(i => getImageTimePoint(i) === firstTimePoint);
	}
	return nonAnchorImage;
}

function getImageTimePoint(image) {
	return image?.metadata?.clinical?.acquisition_day;
}

function getImageModality(image) {
	return image?.metadata?.acquisition?.image_type;
}

function getItemLesionID(item) {
	return item?.metadata?.clinical?.lesion_id;
}

function checkMultipleModality(lesionID) {
	const lesionModalitiesCount = getLesionModalitiesCount(lesionID);
	return lesionModalitiesCount > 1;
}

function getCurrentItem() {
	return currentItem;
}

function setCurrentItem(item) {
	currentItem = item;
}

function getItemID(item) {
	return item?.isic_id;
}

function getItemTimePoint(item) {
	return item?.metadata?.clinical?.acquisition_day;
}

function getItemModality(item) {
	return item?.metadata?.acquisition?.image_type;
}

function getUploadDay(item) {
	return item?.contribution_day;
}

function getLeftMode() {
	return leftMode;
}

function setLeftMode(mode) {
	leftMode = mode;
}

function getRightMode() {
	return rightMode;
}

function setRightMode(mode) {
	rightMode = mode;
}

function getLeftImage() {
	return leftImage;
}

function setLeftImage(image) {
	leftImage = image;
}

function getRightImage() {
	return rightImage;
}

function setRightImage(image) {
	rightImage = image;
}

function groupByTimePoint(images) {
	const imagesGroups = Object.groupBy(images, i => getImageTimePoint(i));
	return imagesGroups;
}

function groupByModality(images) {
	const imagesGroups = Object.groupBy(images, i => getImageModality(i));
	return imagesGroups;
}

function groupByTimePointAndModality(images) {
	const timePointGroups = Object.groupBy(images, i => getImageTimePoint(i));
	const timePointKeys = Object.keys(timePointGroups);
	const imagesGroups = {};
	timePointKeys.forEach((tpk) => {
		const modalityGroups = Object.groupBy(timePointGroups[tpk], i => getImageModality(i));
		const modalityKeys = Object.keys(modalityGroups);
		modalityKeys.forEach((mk) => {
			imagesGroups[`${tpk} and ${mk}`] = modalityGroups[mk];
		});
	});
	return imagesGroups;
}

function groupByID(images) {
	const imagesGroups = Object.groupBy(images, i => getItemID(i));
	return imagesGroups;
}

function setCurrentLeftImages(images) {
	currentLeftImagesCollection.clearAll();
	currentLeftImagesCollection.parse(images);
}

function getCurrentLeftImages() {
	return currentLeftImagesCollection.serialize();
}

function setCurrentRightImages(images) {
	currentRightImagesCollection.clearAll();
	currentRightImagesCollection.parse(images);
}

function getCurrentRightImages() {
	return currentRightImagesCollection.serialize();
}

function getNextLeftImage(image) {
	const currentImage = currentLeftImagesCollection.find(
		i => getItemID(i) === getItemID(image),
		true
	);
	const nextImageId = currentLeftImagesCollection.getNextId(currentImage.id)
		?? currentLeftImagesCollection.getFirstId();
	const nextImage = currentLeftImagesCollection.getItem(nextImageId);
	return nextImage;
}

function getNextRightImage(image) {
	const currentImage = currentRightImagesCollection.find(
		i => getItemID(i) === getItemID(image),
		true
	);
	const nextImageId = currentRightImagesCollection.getNextId(currentImage.id)
		?? currentRightImagesCollection.getFirstId();
	const nextImage = currentRightImagesCollection.getItem(nextImageId);
	return nextImage;
}

function getPrevLeftImage(image) {
	const currentImage = currentLeftImagesCollection.find(
		i => getItemID(i) === getItemID(image),
		true
	);
	const prevImageId = currentLeftImagesCollection.getPrevId(currentImage.id)
		?? currentLeftImagesCollection.getLastId();
	const prevImage = currentLeftImagesCollection.getItem(prevImageId);
	return prevImage;
}

function getPrevRightImage(image) {
	const currentImage = currentRightImagesCollection.find(
		i => getItemID(i) === getItemID(image),
		true
	);
	const prevImageId = currentRightImagesCollection.getPrevId(currentImage.id)
		?? currentRightImagesCollection.getLastId();
	const prevImage = currentRightImagesCollection.getItem(prevImageId);
	return prevImage;
}

export default {
	setLesions,
	getLesionImagesCount,
	getLesionModalitiesCount,
	getModalityImages,
	getImagesWithModalityCount,
	getLesionTimePointsCount,
	getLesionAnchorImageID,
	getLesionImages,
	getTimePointImages,
	getCombineImages,
	getImagesWithTimePointsCount,
	getAnchorImageID,
	getItemLesionID,
	checkMultipleModality,
	getCurrentItem,
	setCurrentItem,
	getItemID,
	getItemTimePoint,
	getItemModality,
	getUploadDay,
	getLeftMode,
	setLeftMode,
	getRightMode,
	setRightMode,
	getLeftImage,
	setLeftImage,
	getRightImage,
	setRightImage,
	checkIsImageAnchor,
	getFirstNonAnchorImage,
	groupByModality,
	groupByTimePoint,
	groupByTimePointAndModality,
	groupByID,
	setCurrentLeftImages,
	getCurrentLeftImages,
	setCurrentRightImages,
	getCurrentRightImages,
	getPrevLeftImage,
	getNextLeftImage,
	getPrevRightImage,
	getNextRightImage,
};
