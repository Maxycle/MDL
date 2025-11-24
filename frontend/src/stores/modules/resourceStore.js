import { defineStore } from "pinia"
import axios from 'axios'

export const useResourceStore = defineStore({
  id: 'resourceStore',
  state: () => ({
    resources: []
  }),
  getters: {
    getResources() {
      return this.resources
    }
  },
  actions: {
    async fetchResources() {
      try {
        const response = await axios.get('/api/resources')
        this.resources = response.data
      } catch (error) {
        console.error('Store: Error fetching posts:', error)
      }
    }
  }
})