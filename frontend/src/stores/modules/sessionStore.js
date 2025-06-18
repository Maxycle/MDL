import { defineStore } from "pinia"
import axios from "axios"

export const useSessionStore = defineStore({
	id: 'sessionStore',
	state: () => ({
		authToken: null,
		user: {},
		errors: []
	}),

	getters: {
		getAuthToken() {
			return this.authToken
		},

		getUserEmail() {
			return this.user.email
		},

		getUserId() {
			return this.user.id
		},

		getUserCertification() {
			return this.user.certification
		},

		getUserUsername() {
			return this.user.username
		},

		isAdmin() {
			return this.user.admin
		},

		getUserDetails() {
			return this.user
		},

		getErrors() {
			return this.errors
		},

		isLoggedIn() {
			const loggedOut = this.authToken === null || this.authToken === JSON.stringify(null)
			return !loggedOut
		}
	},

	actions: {
		async registerUser(params, token) {
			try {
				const response = await axios.post(`/api/signup?token=${token}`, {
					user: params
				})

				return true
			} catch (error) {
				if (error.response && error.response.data) {
					this.errors = error.response.data.errors || [error.response.data.message]
					console.log(`An error occurred: ${error.response.data.message}`)
				} else {
					console.log(`An error occurred: ${error.message}`)
				}
				return false
			}
		},

		loginUser(params) {
			return this.handleUserForm('/api/login', params, "login")
		},

		updateUser(params) {
			return this.handleUserForm('/api/signup', params, "update")
		},

		async handleUserForm(url, params, action) {
			try {
				let response
				if (action === "update") {
					response = await axios.patch(url, { user: params }, {
						headers: { Authorization: this.authToken }
					})
				} else {
					response = await axios.post(url, { user: params })
				}

				this.authToken = action === "update" ? this.authToken : response.headers.authorization
				localStorage.setItem("authToken", this.authToken)
				this.user = response.data.user
				return true
			} catch (error) {
				let errorMessage = "An error occurred" // Default message

				if (error.response) {
					// Server responded with error status
					if (error.response.data) {
						errorMessage = error.response.data.message || error.response.data || errorMessage
					}
				} else if (error.request) {
					// Request was made but no response received
					errorMessage = "Network error occurred"
				} else {
					// Something else happened
					errorMessage = error.message
				}

				this.errors = [errorMessage]
				console.log(`An error occurred 26: ${error.message}`)
				return false
			}
		},

		async loginUserWithToken(token) {
			try {
				const response = await axios.get('/api/member-data', {
					headers: { Authorization: token }
				})

				this.user = response.data.user
				this.authToken = localStorage.getItem("authToken")
			} catch (error) {
				console.log(`An error occurred while logging in: ${error.message}`)
				this.reset()
			}
		},

		async logoutUser() {
			if (!this.authToken) {
				console.log("No authToken found, user might already be logged out");
				this.reset();
				return;
			}
			
			try {
				await axios.delete('/api/logout', {
					headers: { Authorization: this.authToken }
				})

				this.reset()
			} catch (error) {
				if (error.response && error.response.data) {
					console.log(`An error occurred while logging out: ${error.response.data.message}`)
				} else {
					console.log(`An error occurred while logging out: ${error.message}`)
				}
			}
		},
    
		reset() {
			this.$reset()
			localStorage.removeItem("authToken")
		},

		clearErrors() {
			this.errors = []
		}
	}
})