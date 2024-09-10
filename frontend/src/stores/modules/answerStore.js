import { defineStore } from "pinia"
import { useParamsStore } from "./paramsStore";

export const useAnswerStore = defineStore({
	id: 'answerStore',
	state: () => ({
		answers: {},
		details: {},
		averageValues: {}
	}),

	getters: {
		isSuccessful() {
			const paramsStore = useParamsStore()
			this.calculateAverage()
			return (this.averageValues.LOW > paramsStore.getParams.low_threshold &&
				this.averageValues.MID > paramsStore.getParams.mid_threshold &&
				this.averageValues.HIGH > paramsStore.getParams.high_threshold)
		},

		getQuestionnaireDetails() {
			return this.details
		}
	},

	actions: {
		addAnswer(answer) {
			this.answers = { ...this.answers, ...answer }
			// for (const answer in this.answers) { this.score += this.answers[answer].value }
		},

		reset() {
			this.answers = {}
		},

		addDetails(details) {
			this.details = details
		},

		calculateAverage() {
			// Initialize an object to store the sum of values and count for each difficulty level
			const averages = {
				LOW: { sum: 0, count: 0 },
				MID: { sum: 0, count: 0 },
				HIGH: { sum: 0, count: 0 }
			};

			// Iterate through the array to accumulate the sum and count for each difficulty level
			Object.values(this.answers).forEach(item => {
				if (averages[item.question_difficulty]) {
					averages[item.question_difficulty].sum += item.value;
					averages[item.question_difficulty].count += 1;
				} else {
					console.warn('Unknown difficulty level:', item.question_difficulty);
				}
			});

			// Calculate the average value for each difficulty level
			this.averageValues = {};
			for (let level in averages) {
				const { sum, count } = averages[level];
				console.log('sum =>', sum, 'count=>', count)
				this.averageValues[level] = count > 0 ? sum / count : undefined;
			}
		}
	}
})
