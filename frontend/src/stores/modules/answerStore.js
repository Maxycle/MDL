import { defineStore } from "pinia"

export const useAnswerStore = defineStore({
	id: 'answerStore',
	state: () => ({
		answers: {},
		score: 0
	}),

	getters: {
		getAnswers() {
			return this.answers
		},

		getScore() {
			return this.score
		}
	},

	actions: {
		addAnswer(answer) {
			this.score = 0
			this.answers = { ...this.answers, ...answer }
			for (const answer in this.answers) { this.score += this.answers[answer].value }
		},

		reset() {
			this.answers = {}
			this.score = 0
		}
	}
})
