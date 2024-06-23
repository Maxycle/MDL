<template>
	<div class="flex flex-col items-center mb-6" v-for="(question, indexQuestion) in questionsListt" :key="indexQuestion">
		<Question :text="question.content" class="my-2" />
		<div class="border-4 rounded-lg text-black anarcap-border">
			<div v-for="(answer, indexAnswer) in question.answers" :key="indexAnswer">
				<Answer :text="answer.content" :value="answer.value" />
			</div>
		</div>
		<!-- <div class="anarcap-border border-4 bg-blue-500 p-2 rounded mt-2">Envoyer</div> -->
	</div>
	<v-pagination v-model="page" :length="20" :total-visible="5" prev-icon="mdi-menu-left" next-icon="mdi-menu-right"></v-pagination>
</template>

<script>
import Question from './Question.vue';
import Answer from './Answer.vue'

export default {
	components: {
		Question,
		Answer
	},

	props: {
		questionsList: {
			type: Array,
			required: true
		}
	},

	data: () => ({
		page: 1
	}),

	methods: {
		onPageChange(event) {
			console.log(event)
		},
	},
	computed: {
		questionsListt() {
			var clone = JSON.parse(JSON.stringify(this.questionsList));
			var startFrom = this.page - 1;
			console.log('clone.splice(startFrom, 1)', clone.splice(startFrom, 1))
			return clone.splice(startFrom, 1);
		}
	}
}
</script>
