import { defineStore } from "pinia"

const BACKEND_URL = "http://localhost:3000"

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

		getUserUsername() {
			return this.user.username
		},

		isLoggedIn() {
			const loggedOut = this.authToken === null || this.authToken === JSON.stringify(null)

			return !loggedOut
		}
	},

	actions: {
		registerUser(params) {
			return this.handleUserForm(`${BACKEND_URL}/signup`, params)
		},

		loginUser(params) {
			return this.handleUserForm(`${BACKEND_URL}/login`, params)
		},

		async handleUserForm(url, params) {
			try {
				const res = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ user: params })
				})

				if (!res.ok) {
					const error = await res.json()
					this.errors = error.message

					console.log(`An error occured: ${error.message}`)
					return false
				}
				console.log('handleUserForm', res)
				this.authToken = res.headers.get("Authorization")
				localStorage.setItem("authToken", this.authToken)
				const data = await res.json()
				console.log("dataaa logged in", data)
				this.user = data.user
				return true
			} catch (error) {
				console.log(`An error occured: ${error}`)
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
		}
	}
})
