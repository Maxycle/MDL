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
			} catch (error) {
				console.error('Error fetching scores:', error.message);
			}
		},

		async deleteScore(scoreId) {
			const sessionStore = useSessionStore();
			try {
				await axios.delete(`/api/scores/${scoreId}`, {
					headers: {
						Authorization: `${sessionStore.getAuthToken}`
					}
				});
				this.fetchScores(); // Just update the store's scores
			} catch (error) {
				console.error('Error deleting scores:', error.message);
			}
		}
	}
})
