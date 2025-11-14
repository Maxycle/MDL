import { defineStore } from "pinia"
import axios from 'axios'

export const useUserStore = defineStore({
	id: 'userStore',
	state: () => ({
		users: [],
		publicUsers: []
	}),

	getters: {
		getUsers() {
			return this.users
		},
		getPublicUsers() {
			return this.publicUsers
		}
	},

	actions: {
		async fetchUsers() {
			try {
				const response = await axios.get('/api/users')
				this.users = response.data.sort((a, b) => a.last_name.localeCompare(b.last_name))
				this.publicUsers = this.users.filter((user) => user.certification_is_public === true).sort((a, b) => a.last_name.localeCompare(b.last_name))
			} catch (error) {
				console.error('Error fetching users:', error)
			}
		}
	}
})