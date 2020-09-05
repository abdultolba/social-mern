import axios from 'axios'
import cogoToast from 'cogo-toast'

import store from '../store'
import { logout } from '../actions/app'

class Api {
	constructor() {
		this.baseUrl = 'https://friendly-social.herokuapp.com/api'
	}

	/**
	 * Takes a path string as input and attempts a 
	 * GET request. Returns a 401 error on rejection
	 * @param {string} url the URL path for a specific GET request.
	 */
	get(url) {
		const state = store.getState()
		const config = {
			headers: {}
		}

		if (state.app.logged.token)
			config.headers['authToken'] = state.app.logged.token

		return new Promise((res, rej) => {
			axios.get(`${this.baseUrl}/${url}`, config)
				.then(response => res(response.data))
				.catch(e => {
					const { status, data } = e.response
					switch (status) {
						case 401:
							store.dispatch(logout())
							break
					}
					cogoToast.error(`${status}: ${data.message}`, {
						position: 'bottom-right'
					})
					rej(e)
				})
		})
	}

	/**
	 * Takes a path string and optional data as input and 
	 * attempts a POST request. Returns a 401 error on rejection
	 * @param {string} url 		the URL path for a specific POST request.
	 * @param {object} [params] an object that contains the data that will be sent
	 */
	post(url, params) {
		const state = store.getState()
		const config = {
			headers: {}
		}

		if (state.app.logged.token)
			config.headers['authToken'] = state.app.logged.token

		return new Promise((res, rej) => {
			axios.post(`${this.baseUrl}/${url}`, params, config)
				.then(response => res(response.data))
				.catch(e => {
					const { status, data } = e.response
					switch (status) {
						case 401:
							store.dispatch(logout())
							break
					}
					cogoToast.error(`${status}: ${data.message}`, {
						position: 'bottom-right'
					})
					rej(e)
				})
		})
	}

	/**
	 * Takes a path string and optional data as input and 
	 * attempts a PATCH request. Returns a 401 error on rejection
	 * @param {string} url 		the URL path for a specific PATCH request.
	 * @param {object} [params] an object that contains the data that will be sent, headers
	 */
	patch(url, params) {
		const state = store.getState()
		if (!state.app.logged.token) return

		const config = {
			headers: {
				authToken: state.app.logged.token
			}
		}

		return new Promise((res, rej) => {
			axios.patch(`${this.baseUrl}/${url}`, params, config)
				.then(response => res(response.data))
				.catch(e => {
					const { status, data } = e.response
					switch (status) {
						case 401:
							store.dispatch(logout())
							break
					}
					cogoToast.error(`${status}: ${data.message}`, {
						position: 'bottom-right'
					})
					rej(e)
				})
		})
	}

	/**
	 * Takes a path string and optional data as input and 
	 * attempts a PATCH request. Returns a 401 error on rejection
	 * @param {string} url 		the URL path for a specific DELETE request.
	 * @param {object} [params] an object that contains additional data & headers
	 */
	delete(url, params) {
		const state = store.getState()
		if (!state.app.logged.token) return

		const config = {
			headers: {
				authToken: state.app.logged.token
			},
			data: params
		}

		return new Promise((res, rej) => {
			axios.delete(`${this.baseUrl}/${url}`, config)
				.then(response => res(response.data))
				.catch(e => {
					const { status, data } = e.response
					switch (status) {
						case 401:
							store.dispatch(logout())
							break
					}
					cogoToast.error(`${status}: ${data.message}`, {
						position: 'bottom-right'
					})
					rej(e)
				})
		})
	}
}


export default Api