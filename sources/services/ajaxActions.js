import axios from "axios";

import state from "app-models/state";

import logger from "../utils/logger";
import util from "../utils/util";

const API_URL = process.env.ISIC_NEW_API_URL;

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
				logger.info(`Not JSON response for request to ${xhr.responseURL}`);
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

async function getAuthHeaders() {
	const isicClient = state.auth.getClient();
	await isicClient.maybeRestoreLogin();
	return isicClient.authHeaders;
}

class AjaxActions {
	getNewApiUrl() {
		return API_URL;
	}

	_ajax() {
		return webix.ajax();
	}

	_parseData(data) {
		return data ? data.json() : data;
	}

	async _ajaxGet(url, params) {
		const headers = await getAuthHeaders();
		if (!params) {
			params = {};
		}
		// to prevent caching for IE 11 on Window 10
		if (navigator.userAgent.indexOf("MSIE") !== -1
			|| navigator.appVersion.indexOf("Trident/") > -1) {
			params.uid = webix.uid();
		}
		return webix.ajax().headers(headers).get(url, params);
	}

	async getUserInfo() {
		const headers = await getAuthHeaders();
		const axiosConfig = {
			method: "get",
			url: `${API_URL}users/me/`,
			headers
		};
		try {
			const userInfoResponse = await axios(axiosConfig);
			return userInfoResponse?.data || {};
		}
		catch (e) {
			webix.message({type: "error", text: e.response.data.detail});
			throw new Error(e.message, {cause: e});
		}
	}

	async putUserTermsOfUse() {
		const headers = await getAuthHeaders();
		return this._ajax()
			.headers(headers)
			.put(`${API_URL}users/accept-terms/`)
			.fail(parseError)
			.then(result => result?.data || {});
	}

	// New API
	getImages(sourceParams) {
		if (sourceParams?.filter || sourceParams?.collections
		) {
			sourceParams.conditions = sourceParams.filter;
			return this.searchImages(sourceParams);
		}
		const params = sourceParams ? {
			limit: sourceParams.limit || 0
		} : {};
		return this._ajaxGet(`${API_URL}images/`, params)
			.then(result => this._parseData(result))
			.catch(parseError);
	}

	getImagesByUrl(url) {
		return this._ajaxGet(url)
			.then(result => this._parseData(result))
			.catch(parseError);
	}

	// New API
	getImageItem(isicId) {
		return this._ajaxGet(`${API_URL}images/${isicId}/`)
			.then(result => this._parseData(result))
			.catch(parseError);
	}

	// New API
	searchImages(sourceParams) {
		const conditions = sourceParams.conditions || "";
		const collections = sourceParams.collections || "";
		const params = {
			limit: sourceParams.limit || 0,
			query: conditions,
			collections
		};
		return this._ajaxGet(`${API_URL}images/search/`, params)
			.then(result => this._parseData(result))
			.catch(parseError);
	}

	// instead of getHistogram
	// New API
	async getFacets(sourceParams = {}) {
		const {conditions = null, collections = ""} = sourceParams;
		const params = {
			query: conditions,
			collections
		};

		try {
			const result = await this._ajaxGet(`${API_URL}images/facets/`, params);
			const facets = this._parseData(result);
			const intervalMap = {
				clin_size_long_diam_mm: 10,
				age_approx: 5,
				mel_thick_mm: 0.5
			};

			Object.entries(facets).forEach(([id, facet]) => {
				facet.buckets = facet.buckets.map(bucket => ({
					...bucket,
					key: bucket.key_as_string ?? bucket.key
				}));

				if (intervalMap[id]) {
					const interval = intervalMap[id];
					facet.buckets = facet.buckets.map(bucket => ({
						...bucket,
						key: `[${bucket.key}-${bucket.key + interval})`,
						from: bucket.key,
						to: bucket.key + interval
					}));
				}
			});
			return facets;
		} catch (error) {
			return parseError(error);
		}
	}

	getAllImages(sourceParams, annotatedImages) {
		const params = sourceParams ? {
			limit: sourceParams.limit || 0
		} : {limit: 0};

		return this._ajaxGet(`${API_URL}images/`, params)
			.then((result) => {
				if (annotatedImages) {
					return {
						allImages: this._parseData(result),
						annotatedImages
					};
				}
				return {allImages: this._parseData(result)};
			})
			.catch(parseError);
	}

	getCollections(sourceParams) {
		const params = sourceParams ? {...sourceParams} : {limit: 0};
		return this._ajaxGet(`${API_URL}collections/`, params)
			.then(result => this._parseData(result));
	}

	async getDownloadUrl(type, query) {
		try {
			const params = {
				query
			};
			const headers = await getAuthHeaders();
			headers["Content-Type"] = "application/json";
			const resp = await this._ajax()
				.headers(headers)
				.post(`${API_URL}zip-download/url/`, JSON.stringify(params));
			const url = this._parseData(resp);
			return url;
		}
		catch (err) {
			await parseError(err);
			return null;
		}
	}

	async downloadImage(url, name) {
		if (util.isIOS()) {
			util.openImageInNewTab(url, name);
		}
		else if (url) {
			return webix.ajax().response("blob").get(`${url}`, (text, blob) => {
				webix.html.download(blob, `${name}`);
			});
		}
		return null;
	}

	async getLesions(/* sourceParams */) {
		try {
			const result = await this._ajaxGet(`${API_URL}lesions/`);
			return this._parseData(result);
		}
		catch (error) {
			parseError(error);
			return [];
		}
	}

	async getLesionByID(lesionID) {
		try {
			const result = await this._ajaxGet(`${API_URL}lesions/${lesionID}/`);
			return this._parseData(result);
		}
		catch (error) {
			parseError(error);
			return null;
		}
	}
}

const instance = new AjaxActions();
export default instance;
