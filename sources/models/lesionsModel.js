const lesionsMap = new Map();
let currentItem;

// TODO: delete?
// function addLesion(lesion) {}

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

function getLesionTimePointsCount(lesionID) {
	const lesion = getLesionByID(lesionID);
	const images = lesion.images;
	const lesionTimePointsCount = images.reduce((timePoints, img) => {
		const imgTimePoint = getImageTimePoint(img);
		if (timePoints.includes(imgTimePoint)) {
			return timePoints;
		}
		timePoints.push(imgTimePoint);
		return timePoints;
	}, [])?.length;
	return lesionTimePointsCount;
}

function getLesionImages(lesionID) {
	const lesion = getLesionByID(lesionID);
	return lesion.images;
}

function getModalityImages(lesionID, modality) {
	const lesionImages = getLesionImages(lesionID);
	return lesionImages.filter(i => getImageModality(i) === modality);
}

function getTimePointImages(lesionID, timePoint) {
	const lesionImages = getLesionImages(lesionID);
	return lesionImages.filter(i => getImageTimePoint(i) === timePoint);
}

function getAnchorImageID(lesionID) {
	const lesion = getLesionByID(lesionID);
	return lesion.index_image_id;
}

function getImageTimePoint(image) {
	return image.metadata.clinical.acquisition_day;
}

function getImageModality(image) {
	return image.metadata.acquisition.image_type;
}

function getItemLesionID(item) {
	return item.metadata.clinical.lesion_id;
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

export default {
	setLesions,
	getLesionImagesCount,
	getLesionModalitiesCount,
	getLesionTimePointsCount,
	getLesionAnchorImageID,
	getLesionImages,
	getTimePointImages,
	getModalityImages,
	getAnchorImageID,
	getItemLesionID,
	checkMultipleModality,
	getCurrentItem,
	setCurrentItem,
};
