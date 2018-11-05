import authService from "../services/auth";
import axios from "../../node_modules/axios/dist/axios.min";
import appconfig from "../../appconfig.json";

const BASE_API_URL = appconfig.baseApiUrl;

function parseError(xhr) {
	let message;
	switch (xhr.status) {
		case 404:
		{
			message = "Not found";
			webix.message({type: "error", text: message});
			break;
		}
		default:
		{
			try {
				let response = JSON.parse(xhr.response);
				message = response.message;
			}
			catch (e) {
				message = xhr.response;
				console.log(`Not JSON response for request to ${xhr.responseURL}`);
			}
			webix.message({type: "error", text: message, expire: -1});
			break;
		}
	}
	return Promise.reject(xhr);
}

webix.attachEvent("onBeforeAjax", (mode, url, data, request, headers, files, promise) => {
	headers["Girder-Token"] = authService.getToken();
});


class AjaxActions {
	getBaseApiUrl() {
		return BASE_API_URL;
	}

	_ajax() {
		return webix.ajax();
	}
	_parseData(data) {
		return data ? data.json() : data;
	}

	_ajaxGet(url, params) {
		if (!params) {
			params = {};
		}
		// to prevent caching(because of cache we have problems on dashboard page for ie11 on win10)
		params.uid = webix.uid();
		return webix.ajax().get(url, params);
	}

	login(sourceParams) {
		const params = sourceParams ? {
			username: sourceParams.username || 0,
			password: sourceParams.password || 0
		} : {};
		const tok = `${params.username}:${params.password}`;
		let hash;
		try {
			hash = btoa(tok);
		}
		catch (e) {
			console.log("Invalid character in password or login");
		}
		return webix.ajax()
			.headers({
				Authorization: `Basic ${hash}`
			})
			.get(`${BASE_API_URL}user/authentication`)
			.then(result => this._parseData(result));
	}

	logout() {
		return webix.ajax().del(`${BASE_API_URL}user/authentication`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getUserInfo() {
		return this._ajaxGet(`${BASE_API_URL}/user/me`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	postUserTermsOfUse(acceptTerms) {
		return this._ajax().post(`${BASE_API_URL}user/acceptTerms`, acceptTerms)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getUsers(userParams) {
		const params = userParams ? {
			limit: userParams.limit || 26,
			offset: userParams.offset || 0,
			sort: userParams.sort || "lastName",
			sortdir: userParams.sortdir || "1"
		} : {};

		return this._ajaxGet(`${BASE_API_URL}user`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getStudy(id) {
		return this._ajaxGet(`${BASE_API_URL}study/${id}`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getStudies(sourceParams) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			sort: sourceParams.sort || "lowerName",
			sortdir: sourceParams.sortdir || "1",
			detail: sourceParams.detail || false
		} : {};
		if (sourceParams && sourceParams.state !== undefined && sourceParams.state !== "") {
			params.state = sourceParams.state;
		}
		if (sourceParams && sourceParams.userId !== undefined && sourceParams.userId !== "") {
			params.userId = sourceParams.userId;
		}
		return this._ajaxGet(`${BASE_API_URL}/study`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getDataset(sourceParams) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			sort: sourceParams.sort || "_id",
			sortdir: sourceParams.sortdir || "-1",
			detail: sourceParams.detail || false
		} : {};
		return this._ajaxGet(`${BASE_API_URL}dataset`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getDatasetItem(id) {
		return this._ajaxGet(`${BASE_API_URL}dataset/${id}`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getFeatureset(sourceParams) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			sort: sourceParams.sort || "name",
			sortdir: sourceParams.sortdir || "1"
		} : {};
		return this._ajaxGet(`${BASE_API_URL}featureset`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getFeaturesetItem(id) {
		return webix.ajax().get(`${BASE_API_URL}featureset/${id}`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getImages(sourceParams) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			sort: sourceParams.sort || "name",
			sortdir: sourceParams.sortdir || "1",
			detail: sourceParams.detail || false
		} : {};
		if (sourceParams && sourceParams.datasetId) {
			params.datasetId = sourceParams.datasetId;
		}
		if (sourceParams && sourceParams.name) {
			params.name = sourceParams.name;
		}
		if (sourceParams && sourceParams.filter) {
			params.filter = sourceParams.filter;
		}
		return this._ajaxGet(`${BASE_API_URL}image`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getImageItem(id) {
		return this._ajaxGet(`${BASE_API_URL}image/${id}`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	/* getResource(name) {
		let BASE_API_URL = "http://dermannotator.org:8080/api/v1"; // TODO: remove after api will be moved to isic "https://isic-archive.com/api/v1/";
		const url = `${BASE_API_URL}/resource/search?mode=prefix&types=%5B%22item%22%5D&q=${name}`;
		return this._ajaxGet(url)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getFolder(folderId) {
		let BASE_API_URL = "http://dermannotator.org:8080/api/v1";// TODO: remove after api will be moved to isic "https://isic-archive.com/api/v1/";
		const folderUrl = `${BASE_API_URL}/folder/${folderId}`;
		return this._ajaxGet(folderUrl)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getTiles(itemId) {
		let BASE_API_URL = "http://dermannotator.org:8080/api/v1";// TODO: remove after api will be moved to isic "https://isic-archive.com/api/v1/";
		const url = `${BASE_API_URL}/item/${itemId}/tiles`;
		return this._ajaxGet(url)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getFiles(itemId) {
		let BASE_API_URL = "http://dermannotator.org:8080/api/v1";// TODO: remove after api will be moved to isic "https://isic-archive.com/api/v1/";
		const filesUrl = `${BASE_API_URL}/item/${itemId}/files`;
		return this._ajaxGet(filesUrl)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}
	downloadFile(fileId) {
		let BASE_API_URL = "http://dermannotator.org:8080/api/v1"; // TODO: remove after api will be moved to isic "https://isic-archive.com/api/v1/";
		const downloadUrl = `${BASE_API_URL}/file/${fileId}/download`;
		return this._ajaxGet(downloadUrl)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}*/

	getSegmentation(sourceParams) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			sort: sourceParams.sort || "created",
			sortdir: sourceParams.sortdir || "-1",
			imageId: sourceParams.imageId
		} : {};
		return this._ajaxGet(`${BASE_API_URL}segmentation`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getSegmentationItem(id) {
		return this._ajaxGet(`${BASE_API_URL}segmentation/${id}`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getHistogram(filter) {
		const params = {};
		if (filter) {
			params.filter = filter;
		}
		return this._ajaxGet(`${BASE_API_URL}image/histogram`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getAnnotations(sourceParams) {
		const params = sourceParams ? {
			studyId: sourceParams.studyId
		} : {};
		if (sourceParams && sourceParams.userId) {
			params.userId = sourceParams.userId;
		}
		if (sourceParams && sourceParams.imageId) {
			params.imageId = sourceParams.imageId;
		}
		if (sourceParams && sourceParams.state) {
			params.state = sourceParams.state;
		}
		return this._ajaxGet(`${BASE_API_URL}annotation`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getSegmentationMask(id) {
		return webix.ajax().response("blob").get(`${BASE_API_URL}segmentation/${id}/mask`)
			.fail(this._parseError);
	}

	search(sourceParams) {
		const params = {
			q: sourceParams && sourceParams.q ? sourceParams.q : "",
			mode: sourceParams && sourceParams.mode ? sourceParams.mode : "prefix",
			types: sourceParams && sourceParams.types ? sourceParams.types : ["user"]
		};
		return this._ajaxGet(`${BASE_API_URL}resource/search`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	addAnnotatorsToStudy(studyId, userIds) {
		const params = {
			userIds
		};
		return webix.ajax().post(`${BASE_API_URL}study/${studyId}/users`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	removeAnnotatorFromStudy(studyId, userId) {
		return webix.ajax().del(`${BASE_API_URL}study/${studyId}/users/${userId}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	removeStudy(studyId) {
		return webix.ajax().del(`${BASE_API_URL}study/${studyId}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getDatasetAccess(id) {
		return this._ajaxGet(`${BASE_API_URL}dataset/${id}/access`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	putDatasetAccess(id, sourceParams) {
		const params = {
			access: sourceParams && sourceParams.access ? sourceParams.access : [],
			public: sourceParams && sourceParams.public ? sourceParams.public : false
		};
		return webix.ajax().put(`${BASE_API_URL}dataset/${id}/access`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	putUser(id, sourceParams) {
		if (!(id && sourceParams)) {
			return;
		}
		const params = {
			firstName: sourceParams.firstName,
			lastName: sourceParams.lastName,
			email: sourceParams.email
		};
		if (sourceParams.admin) {
			params.admin = sourceParams.admin;
		}
		if (sourceParams.status) {
			params.status = sourceParams.status;
		}
		return webix.ajax().put(`${BASE_API_URL}user/${id}`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	putPassword(sourceParams) {
		if (!sourceParams) {
			return;
		}
		const params = {
			new: sourceParams.new,
			old: sourceParams.old
		};
		return webix.ajax().put(`${BASE_API_URL}user/password`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	postUser(sourceParams) {
		if (!sourceParams) {
			return;
		}
		const params = {
			login: sourceParams.login,
			email: sourceParams.email,
			firstName: sourceParams.firstName,
			lastName: sourceParams.lastName,
			password: sourceParams.password
		};
		return webix.ajax().post(`${BASE_API_URL}user`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getTemporaryUserInfo(id, token) {
		const params = {
			token
		};
		return this._ajaxGet(`${BASE_API_URL}user/password/temporary/${id}`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getTaskSegmentation() {
		return this._ajaxGet(`${BASE_API_URL}task/me/segmentation`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	createDatasetPermission() {
		return webix.ajax().post(`${BASE_API_URL}user/requestCreateDatasetPermission`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	sendInvitation(sourceParams) {
		if (!sourceParams) {
			return;
		}
		const params = {
			login: sourceParams.login,
			email: sourceParams.email,
			firstName: sourceParams.firstName,
			lastName: sourceParams.lastName
		};
		if (sourceParams.validityPeriod) {
			params.validityPeriod = sourceParams.validityPeriod;
		}
		return webix.ajax().post(`${BASE_API_URL}user/invite`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	createDataset(sourceParams) {
		if (!sourceParams) {
			return;
		}
		const params = {
			name: sourceParams.name,
			description: sourceParams.description,
			license: sourceParams.license,
			attribution: sourceParams.attribution,
			owner: sourceParams.owner
		};
		return webix.ajax().post(`${BASE_API_URL}dataset`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	addImageMetadata(imageId, sourceParams) {
		if (!(sourceParams && imageId)) {
			return;
		}
		const params = {
			id: imageId,
			metadata: sourceParams.metadata
		};
		if (sourceParams.validityPeriod) {
			params.save = sourceParams.save;
		}
		return webix.ajax().post(`${BASE_API_URL}image/${imageId}/metadata`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}
	// batchUpload zip (dataset)
	// addZipMetadata(zipId, sourceParams) {
	// 	debugger
	// 	if (!(sourceParams && imageId)) {
	// 		return;
	// 	}
	// 	const params = {
	// 		id: imageId,
	// 		metadata: sourceParams.metadata
	// 	};
	// 	if (sourceParams.validityPeriod) {
	// 		params.save = sourceParams.save;
	// 	}
	// 	return webix.ajax().post(`${BASE_API_URL}image/${imageId}/metadata`, params)
	// 		.fail(parseError)
	// 		.then(result => this._parseData(result));
	// }

	participateStudy(studyId) {
		if (!studyId) {
			return;
		}
		return webix.ajax().post(`${BASE_API_URL}study/${studyId}/participate`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	addImageToDataset(datasetId, sourceParams, file) {
		if (!(sourceParams && datasetId)) {
			return;
		}
		/* const reader = new FileReader();
		reader.readAsBinaryString(file);
		return webix.ajax()
			.headers({
				"Content-Type": file.type
			})
			.post(`${BASE_API_URL}dataset/${datasetId}/image?filename=${sourceParams.filename}&signature=${sourceParams.signature}`, reader.result.toString())
			.then(result => this._parseData(result));*/
		// we use axios because webix.ajax can not send File in request body as binary, not form data
		return axios({
			method: "post",
			url: `${BASE_API_URL}dataset/${datasetId}/image`,
			params: {
				filename: sourceParams.filename,
				signature: sourceParams.signature
			},
			data: file,
			headers: {
				"Content-Type": file.type,
				"Girder-Token": authService.getToken()
			}
		}).catch((e) => {
			webix.message({type: "error", text: "Uploading file error"});
			return Promise.reject(e);
		}).then(result => result.data);
	}

	getImage(id, height, width) {
		const params = {};
		if (height) {
			params.height = height;
		}
		if (width) {
			params.width = width;
		}
		return webix.ajax().response("blob").get(`${BASE_API_URL}image/${id}/thumbnail`, params)
			.fail(parseError);
	}

	removeParticipationRequest(studyId, userId) {
		if (!studyId || !userId) {
			return;
		}
		return webix.ajax().del(`${BASE_API_URL}study/${studyId}/participate/${userId}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	addUsersToStudy(studyId, userIds) {
		if (!studyId || !userIds || !userIds.length) {
			return;
		}
		const params = {
			userIds
		};
		return webix.ajax().post(`${BASE_API_URL}study/${studyId}/users`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	postImageMetadata(imageId, metadata) {
		let params = {
			save: "true",
			metadata
		};
		if (metadata.sex) {

				params.age_approx = metadata.age_approx,
				params.benign_malignant = metadata.benign_malignant,
				params.diagnosis = metadata.diagnosis,
				params.diagnosis_confirm_type = metadata.diagnosis_confirm_type,
				params.melanocytic = metadata.melanocytic,
				params.sex = metadata.sex

		} else if (metadata.pixelsX) {
			params = {
				//save: metadata ? "true" : "false",
				image_type: metadata.image_type,
				pixelsX: metadata.pixelsX,
				pixelsY: metadata.pixelsY
			};

		} else if (metadata.site) {
			params = {
				//save: metadata ? "true" : "false",
				id1: metadata.id1,
				localization: metadata.localization,
				diagnosis: metadata.diagnosis,
				site: metadata.site
			};
		}

		return webix.ajax().post(`${BASE_API_URL}/image/${imageId}/metadata`, params)
		.fail(parseError)
		.then(result => this._parseData(result));
	}

	getAllImages(sourceParams, annotatedImages) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			sort: sourceParams.sort || "name",
			detail: sourceParams.detail || "true"
		} : {};

		if (sourceParams && sourceParams.filter) {
			params.filter = sourceParams.filter;
		}

		return this._ajax().get(`${BASE_API_URL}image`, params)
			.fail(parseError)
			.then(result => {
				if (annotatedImages) {
					return {
						allImages: this._parseData(result),
						annotatedImages:  annotatedImages
					}
				} else {
					return this._parseData(result);
				}
			});
	}

	createNewStudy(studyParams) {
		const newStudyParams = studyParams ? {
			name: studyParams.name,
			userIds: studyParams.userIds,
			imageIds: studyParams.imageIds,
			questions: studyParams.questions,
			features: studyParams.features
		} : {};
		return this._ajax().header({
			"Content-Type": "application/json"
		}).post(`${BASE_API_URL}study`, newStudyParams)
	}

	getDatasetMetadata(id) {
		return this._ajaxGet(`${BASE_API_URL}dataset/${id}/metadata`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	postDatasetMetadata(datasetId, fileId, sourceParams) {
		const params = {
			save: sourceParams && sourceParams.save ? "true" : "false"
		};
		return webix.ajax().post(`${BASE_API_URL}dataset/${datasetId}/metadata/${fileId}/apply`, params)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	postRegisterMetadata(datasetId, filename, binary) {
		return webix.ajax().headers({
			"Content-Type": "text/csv"
		}).post(`${BASE_API_URL}dataset/${datasetId}/metadata?filename=${filename}`, binary)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	postBatchUpload(datasetId, signature) {
		return webix.ajax().headers({
			"Content-Type": "application/json"
		}).post(`${BASE_API_URL}dataset/${datasetId}/zip`, signature)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	finalizePostBatchUpload(datasetId, batchId) {
		return webix.ajax().post(`${BASE_API_URL}dataset/${datasetId}/zip/${batchId}`)
			.fail(this._parseError)
			.then(result => this._parseData(result));
	}

	getUrlForDownloadRegisteredMetadata(datasetId, metadataFileId) {
		return `${BASE_API_URL}dataset/${datasetId}/metadata/${metadataFileId}/download?token=${authService.getToken()}`
	}

}

const instance = new AjaxActions();
export default instance;
