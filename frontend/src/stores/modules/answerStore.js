import { defineStore } from "pinia"

export const useAnswerStore = defineStore({
	id: 'answerStore',
	state: () => ({
		answers: {}
	}),

	getters: {
		getAnswers() {
			return this.answers
		}
	},

	actions: {
		addAnswer(answer) {
			this.answers = { ...this.answers, ...answer }
		}
	}
})
