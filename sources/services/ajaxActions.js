import axios from "axios";

import state from "../models/state";
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
		return axios(axiosConfig)
			.then(result => result?.data || {}, (e) => {
				webix.message({type: "error", text: e.response.data.detail});
				return Promise.reject(e);
			});
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
		if (sourceParams
			&& sourceParams.filter
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
		const params = {
			limit: sourceParams.limit || 0,
			query: conditions
		};
		return this._ajaxGet(`${API_URL}images/search/`, params)
			.then(result => this._parseData(result))
			.catch(parseError);
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
		return this._ajaxGet(`${API_URL}images/facets/`, params)
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
			})
			.catch(parseError);
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
}

const instance = new AjaxActions();
export default instance;
