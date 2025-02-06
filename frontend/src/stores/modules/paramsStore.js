import { defineStore } from "pinia"
import { useSessionStore } from "./sessionStore";
import axios from 'axios'

export const useParamsStore = defineStore({
  id: 'paramsStore',
  state: () => ({
    params: {},
    isLoaded: false // Add loading state
  }),
  
  getters: {
    getParams() {
      return this.params
    },
    getIsLoaded() {
      return this.isLoaded
    }
  },
  
  actions: {
    async fetchParams() {
      // If already loaded, don't fetch again
      if (this.isLoaded) return
      
      const sessionStore = useSessionStore()
      try {
        const response = await axios.get('/api/questionnaire-params', {
          headers: {
            Authorization: `${sessionStore.getAuthToken}`
          }
        });
        
        this.params = {
          cycleLength: response.data[0].cycle_length,
          tryLength: response.data[0].try_length,
          numberOfTriesPermitted: response.data[0].tries_permitted,
          succeedThreshold: response.data[0].threshold,
          welcome_start: response.data[0].welcome_start,
          welcome_end: response.data[0].welcome_end,
          intro: response.data[0].intro,
          nb_questions_per_questionnaire: response.data[0].nb_questions_per_questionnaire,
          questionnaire_time_limit: response.data[0].questionnaire_time_limit,
          low_threshold: response.data[0].low_threshold,
          mid_threshold: response.data[0].mid_threshold,
          high_threshold: response.data[0].high_threshold
        }
        
        this.isLoaded = true
      } catch (error) {
        console.error('Error fetching questionnaire params:', error.message);
        this.isLoaded = false // Make sure it's false if request fails
      }
    }
  }
})