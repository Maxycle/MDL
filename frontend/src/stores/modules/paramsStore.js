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
      const sessionStore = useSessionStore()
      try {
        const response = await axios.get('/api/questionnaire-params', {
          headers: {
            Authorization: `${sessionStore.getAuthToken}`
          }
        });
        this.params = {
          cycleLength: response.data.cycle_length,
          tryLength: response.data.try_length,
          numberOfTriesPermitted: response.data.tries_permitted,
          succeedThreshold: response.data.threshold,
          welcome_start: response.data.welcome_start,
          welcome_end: response.data.welcome_end,
          intro: response.data.intro,
          nb_questions_per_questionnaire: response.data.nb_questions_per_questionnaire,
          questionnaire_time_limit: response.data.questionnaire_time_limit,
          low_threshold: response.data.low_threshold,
          mid_threshold: response.data.mid_threshold,
          high_threshold: response.data.high_threshold
        }
        
        this.isLoaded = true
      } catch (error) {
        console.error('Error fetching questionnaire params:', error.message);
        this.isLoaded = false // Make sure it's false if request fails
      }
    }
  }
})