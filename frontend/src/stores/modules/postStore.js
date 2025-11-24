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
        const response = await axios.get('/api/posts')
        this.posts = response.data
      } catch (error) {
        console.error('Store: Error fetching posts:', error)
      }
    }
  }
})