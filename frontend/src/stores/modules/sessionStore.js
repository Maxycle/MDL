import { defineStore } from "pinia"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const useSessionStore = defineStore({
	id: 'sessionStore',
	state: () => ({
		authToken: null,
		user: {},
		errors: [],
		registrationStatus: null
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
		async registerUser(params) {
			try {
				const res = await fetch(`${BACKEND_URL}/signup`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ user: params })
				})

				if (!res.ok) {
					const error = await res.json()
					this.errors = error.errors
					console.log(`An error occurred: ${error.message}`)
					return false
				}

				const data = await res.json()
				this.registrationStatus = 'pending_confirmation'
				// Don't set authToken or user data here

				return true
			} catch (error) {
				console.log(`An error occurred: ${error}`)
				return false
			}
		},

		async confirmEmail(token) {
			console.log('BACKEND_URL', BACKEND_URL)
			try {
				const res = await fetch(`${BACKEND_URL}/confirmation?confirmation_token=${token}`, {
					method: "GET"
				})

				if (!res.ok) {
					const error = await res.json()
					this.errors = error.errors
					console.log(`An error occurred during confirmation: ${error.message}`)
					return false
				}

				const data = await res.json()
				// You might want to automatically log the user in here, or just update the status
				this.registrationStatus = 'confirmed'

				return true
			} catch (error) {
				console.log(`An error occurred during confirmation: ${error}`)
				return false
			}
		},

		loginUser(params) {
			return this.handleUserForm(`${BACKEND_URL}/login`, params, "login")
		},

		updateUser(params) {
			return this.handleUserForm(`${BACKEND_URL}/signup`, params, "update")
		},

		async handleUserForm(url, params, action) {
			try {
				const res = await fetch(url, {
					method: action === "update" ? "PATCH" : "POST",
					headers: action === "update" ? { "Content-Type": "application/json", Authorization: this.authToken } : { "Content-Type": "application/json" },
					body: JSON.stringify({ user: params })
				})
				console.log('res', res)
				
				if (!res.ok) {
					console.log('!res.ok', res);
		
					let errorMessage = "An error occurred"; // Default message
		
					// Check if response is JSON
					const contentType = res.headers.get("content-type");
					if (contentType && contentType.includes("application/json")) {
						try {
							const errorData = await res.json();
							errorMessage = errorData.message || errorMessage;
						} catch (jsonError) {
							console.log("Failed to parse JSON error response", jsonError);
						}
					} else {
						// Fallback: parse response as plain text
						try {
							errorMessage = await res.text();
						} catch (textError) {
							console.log("Failed to parse text error response", textError);
						}
					}
		
					// Set error message for display
					this.errors = [errorMessage];
					console.log('this.errors', this.errors);
					console.log(`An error occurred 1: ${errorMessage}`);
					return false;
				}
		
				// console.log('handleUserForm', res)
				this.authToken = action === "update" ? this.authToken : res.headers.get("Authorization")
				localStorage.setItem("authToken", this.authToken)
				const data = await res.json()
				this.user = data.user
				return true
			} catch (error) {
				console.log(`An error occured 26: ${error}`)
				return false
			}
		},

		async loginUserWithToken(token) {
			try {
				const res = await fetch(`${BACKEND_URL}/member-data`, {
					headers: { Authorization: token }
				})
				if (!res.ok) {
					const error = await res.json()
					console.log(`An error occured while logging in: ${error.message}`) // eslint-disable-line no-console
					this.reset()
				} else {
					const data = await res.json()
					console.log("dataaa logged in w token", data)
					this.user = data.user
					this.authToken = localStorage.getItem("authToken")
				}
			} catch (error) {
				console.log(`An error occured while logging in: ${error}`) // eslint-disable-line no-console
			}
		},

		async logoutUser() {
			if (!this.authToken) {
				console.log("No authToken found, user might already be logged out");
				this.reset();
				return;
			}
			try {
				const res = await fetch(`${BACKEND_URL}/logout`, {
					method: "DELETE",
					headers: { Authorization: this.authToken }
				})

				if (!res.ok) {
					const error = await res.json()

					console.log(`An error occured while logging out: ${error.message}`) // eslint-disable-line no-console
					console.log('res', res)
				} else {
					this.reset()
				}
			} catch (error) {
				console.log(`An error occured while logging out: ${error}`) // eslint-disable-line no-console
			}
		},

		reset() {
			this.$reset()
			localStorage.removeItem("authToken")
		},

		clearErrors() {
			this.errors = []
		},

		clearRegistrationStatus() {
			this.registrationStatus = null
		}
	}
})
