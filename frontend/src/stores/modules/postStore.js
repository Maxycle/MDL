import { defineStore } from "pinia"
import axios from 'axios'

export const usePostStore = defineStore({
	id: 'postStore',
	state: () => ({
		posts: []
	}),

	getters: {
		getPosts() {
			return this.posts
		}
	},

	actions: {
		async fetchPosts() {
			try {
				const response = await axios.get(`/api/posts`
				)
				('liste de posts', response)
				this.posts = response.data
			} catch (error) {
				console.error('Error fetching post:', error)
				// Handle error (e.g., show error message)
			}
		}
	}
})
