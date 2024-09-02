import { defineStore } from "pinia"
import { useSessionStore } from "./sessionStore";
import axios from 'axios'

export const useParamsStore = defineStore({
	id: 'paramsStore',
	state: () => ({
		params: {}
	}),

	getters: {
		getParams() {
			return this.params
		}
	},

	actions: {
		async fetchParams() {
			const sessionStore = useSessionStore()
			try {
				const response = await axios.get('/questionnaire-params',
					{
						headers: {
							Authorization: `${sessionStore.getAuthToken}`
						}
					});
				console.log('fetchingzeParams', response.data[0])
				this.params.cycleLength = response.data[0].cycle_length
				this.params.tryLength = response.data[0].try_length
				this.params.numberOfTriesPermitted = response.data[0].tries_permitted
				this.params.succeedThreshold = response.data[0].threshold
				this.params.welcome_start = response.data[0].welcome_start
				this.params.welcome_end = response.data[0].welcome_end
				this.params.intro = response.data[0].intro
				this.params.nb_questions_per_questionnaire = response.data[0].nb_questions_per_questionnaire
				this.params.questionnaire_time_limit = response.data[0].questionnaire_time_limit
			} catch (error) {
				console.error('Error fetching questionnaire params:', error.message);
			}

			// await scoreStore.fetchScores()
		}
	}
})
