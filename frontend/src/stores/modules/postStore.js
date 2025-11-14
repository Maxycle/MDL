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
      console.log('Store: fetchPosts called')
      try {
        console.log('Store: Making API request to /api/posts')
        const response = await axios.get('/api/posts')
        console.log('Store: API response received:', response.data)
        this.posts = response.data
        console.log('Store: posts state updated with', this.posts.length, 'posts')
      } catch (error) {
        console.error('Store: Error fetching posts:', error)
        console.error('Store: Error response:', error.response)
      }
    }
  }
})