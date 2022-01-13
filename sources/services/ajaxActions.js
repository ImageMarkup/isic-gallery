import authService from "./auth";
import axios from "../../node_modules/axios/dist/axios.min";
import state from "../models/state";

const BASE_API_URL = process.env.ISIC_BASE_API_URL;
const NEW_API_URL = process.env.ISIC_NEW_API_URL;

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
				if (response.message) {
					message = response.message;
				}
				else if (response.query) {
					message = response.query[0];
				}
				else {
					message = "Something went wrong";
				}
			}
			catch (e) {
				message = xhr.response;
				console.log(`Not JSON response for request to ${xhr.responseURL}`);
			}
			const regexForId = /".*?" /;
			let messageToShow = message.replace(regexForId, "");
			if (messageToShow.length > 500) {
				messageToShow = messageToShow.slice(0, 497).concat("...");
			}
			webix.message({text: messageToShow, expire: 5000});
			break;
		}
	}
	return Promise.reject(xhr);
}

webix.attachEvent("onBeforeAjax", async (mode, url, data, request, headers, files, promise) => {
	if (url.includes(BASE_API_URL)) {
		headers["Girder-Token"] = authService.getToken();
	}
	else if (url.includes(NEW_API_URL)) {
		const isicClient = authService.getClient();
		isicClient.maybeRestoreLogin()
			.then(() => {
				const authHeaders = isicClient.authHeaders;
				const authHeadersKeys = Object.keys(authHeaders);
				authHeadersKeys.forEach((key) => {
					headers[key] = authHeaders[key];
				});
			});
	}
});


class AjaxActions {
	getBaseApiUrl() {
		return BASE_API_URL;
	}

	getNewApiUrl() {
		return NEW_API_URL;
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
		// to prevent caching for IE 11 on Window 10
		if (navigator.userAgent.indexOf("MSIE") !== -1
			|| navigator.appVersion.indexOf("Trident/") > -1) {
			params.uid = webix.uid();
		}
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
		const webixuid = {
			uid: webix.uid()
		};
		return webix.ajax()
			.headers({
				Authorization: `Basic ${hash}`
			})
			.get(`${BASE_API_URL}user/authentication`, webixuid)
			.then(result => this._parseData(result));
	}

	logout() {
		return webix.ajax().del(`${BASE_API_URL}user/authentication`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getUserInfo() {
		return this._ajaxGet(`${BASE_API_URL}user/me`)
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
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getStudy(id) {
		return this._ajaxGet(`${BASE_API_URL}study/${id}`)
			.fail(parseError)
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
		return this._ajaxGet(`${BASE_API_URL}study`, params)
			.fail(parseError)
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
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getDatasetItem(id) {
		return this._ajaxGet(`${BASE_API_URL}dataset/${id}`)
			.fail(parseError)
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
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getFeaturesetItem(id) {
		return this._ajaxGet(`${BASE_API_URL}featureset/${id}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	// New API
	getImages(sourceParams) {
		if (sourceParams
			&& sourceParams.filter
) {
			sourceParams.conditions = sourceParams.filter;
			return this.searchImages(sourceParams);
		}
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0
		} : {};
		return this._ajaxGet(`${NEW_API_URL}images`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	// New API
	getImageItem(isicId) {
		return this._ajaxGet(`${NEW_API_URL}images/${isicId}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	// New API
	searchImages(sourceParams) {
		const conditions = sourceParams.conditions;
		const params = {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			query: conditions
		};
		return this._ajaxGet(`${NEW_API_URL}images/search`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	// instead of getHistogram
	// New API
	getFacets(sourceParams) {
		const conditions = sourceParams && sourceParams.conditions ? sourceParams.conditions : null;
		const collection = sourceParams && sourceParams.collection ? sourceParams.collection : "";
		const params = {
			query: conditions,
			collection
		};
		return this._ajaxGet(`${NEW_API_URL}images/facets`, params)
			.fail(parseError)
			.then((result) => {
				const facets = this._parseData(result);
				const ids = Object.keys(facets);
				ids.forEach((id) => {
					facets[id].buckets = facets[id].buckets.map((bucket) => {
						if (bucket.key_as_string) {
							return {
								...bucket,
								key: bucket.key_as_string
							};
						}
						return bucket;
					});
					if (id === "clin_size_long_diam_mm"
						|| id === "age_approx") {
						let interval;
						switch (id) {
							case "clin_size_long_diam_mm": {
								interval = 10;
								break;
							}
							case "age_approx": {
								interval = 5;
								break;
							}
							case "mel_thick_mm": {
								interval = 0.5;
								break;
							}
							default: {
								break;
							}
						}
						facets[id].buckets = facets[id].buckets.map((bucket) => {
							const newBucket = {
								...bucket,
								key: `[${bucket.key}-${bucket.key + interval})`,
								from: bucket.key,
								to: `${bucket.key + interval}`
							};
							return newBucket;
						});
					}
				});
				return facets;
			});
	}

	getSegmentation(sourceParams) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0,
			sort: sourceParams.sort || "created",
			sortdir: sourceParams.sortdir || "-1",
			imageId: sourceParams.imageId
		} : {};
		return this._ajaxGet(`${BASE_API_URL}segmentation`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getSegmentationItem(id) {
		return this._ajaxGet(`${BASE_API_URL}segmentation/${id}`)
			.fail(parseError)
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
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getSegmentationMask(id) {
		return webix.ajax().response("blob").get(`${BASE_API_URL}segmentation/${id}/mask`)
			.fail(parseError);
	}

	search(sourceParams) {
		const params = {
			q: sourceParams && sourceParams.q ? sourceParams.q : "",
			mode: sourceParams && sourceParams.mode ? sourceParams.mode : "prefix",
			types: sourceParams && sourceParams.types ? sourceParams.types : ["user"]
		};
		return this._ajaxGet(`${BASE_API_URL}resource/search`, params)
			.fail(parseError)
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

	// TODO: probably will be deleted
	addImageMetadata(imageId, sourceParams) {return}
	// addImageMetadata(imageId, sourceParams) {
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
		}).then(result => result.data, (e) => {
			webix.message({type: "error", text: "Uploading file error"});
			return Promise.reject(e);
		});
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

	getAllImages(sourceParams, annotatedImages) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0,
			offset: sourceParams.offset || 0
		} : {limit: 0, offset: 0};

		return this._ajaxGet(`${NEW_API_URL}images`, params)
			.fail(parseError)
			.then((result) => {
				if (annotatedImages) {
					return {
						allImages: this._parseData(result),
						annotatedImages
					};
				}

				return {allImages: this._parseData(result)};
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
		return this._ajax().headers({
			"Content-Type": "application/json"
		}).post(`${BASE_API_URL}study`, newStudyParams);
	}

	getDatasetMetadata(id) {
		return this._ajaxGet(`${BASE_API_URL}dataset/${id}/metadata`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	postDatasetMetadata(datasetId, fileId, sourceParams) {
		const params = {
			save: sourceParams && sourceParams.save ? "true" : "false"
		};
		return webix.ajax().post(`${BASE_API_URL}dataset/${datasetId}/metadata/${fileId}/apply`, params)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	postRegisterMetadata(datasetId, filename, binary) {
		return webix.ajax().headers({
			"Content-Type": "text/csv"
		}).post(`${BASE_API_URL}dataset/${datasetId}/metadata?filename=${filename}`, binary)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	postBatchUpload(datasetId, signature) {
		return webix.ajax().headers({
			"Content-Type": "application/json"
		}).post(`${BASE_API_URL}dataset/${datasetId}/zip`, signature)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	finalizePostBatchUpload(datasetId, batchId) {
		return webix.ajax().post(`${BASE_API_URL}dataset/${datasetId}/zip/${batchId}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}

	getUrlForDownloadRegisteredMetadata(datasetId, metadataFileId) {
		return `${BASE_API_URL}dataset/${datasetId}/metadata/${metadataFileId}/download?token=${authService.getToken()}`;
	}

	putForgotPasswordEmail(email) {
		return webix.ajax().put(`${BASE_API_URL}user/password/temporary?email=${email}`)
			.fail(parseError)
			.then(result => this._parseData(result));
	}
}

const instance = new AjaxActions();
export default instance;
