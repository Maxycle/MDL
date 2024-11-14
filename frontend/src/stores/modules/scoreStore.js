import { defineStore } from "pinia"
import { useSessionStore } from "./sessionStore";
import axios from 'axios'

export const useScoreStore = defineStore({
	id: 'scoreStore',
	state: () => ({
		scores: {}
	}),

	getters: {
		getScore() {
			return this.scores
		}
	},

	actions: {
		async fetchScores() {
			const sessionStore = useSessionStore();
			try {
				const response = await axios.get(`/api/uzer-scores?user_id=${sessionStore.getUserId}`,
					{
						headers: {
							Authorization: `${sessionStore.getAuthToken}`
						}
					});
				const scores = response.data;
				this.scores.droitNaturel = scores.find(obj => obj.domain === 'DN') || {}
				this.scores.ecoleAutrichienne = scores.find(obj => obj.domain === 'EA') || {}
				console.log('fetch scores in store', response.data)
			} catch (error) {
				console.error('Error fetching scores:', error.message);
			}
		}
	}
})
