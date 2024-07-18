<template>
	<div class="flex flex-col items-center mb-6">
		<Question :text="question.content" class="my-8 shadow-lg shadow-neutral-700" />
		<div class="border-4 rounded-lg text-black anarcap-border shadow-lg shadow-neutral-700">
			<div v-for="(answer, indexAnswer) in question.answers" :key="indexAnswer">
				<Answer	:data="answer" @click="selectAnswer(answer)" />
			</div>
		</div>
	</div>
	<v-pagination v-model="page" :length="questionsList.length" :total-visible="5" prev-icon="mdi-menu-left" next-icon="mdi-menu-right"
		@page="onPageChange"></v-pagination>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnswerStore } from '@/stores/modules/answerStore';
import Question from './Question.vue'
import Answer from './Answer.vue'

const props = defineProps({
	questionsList: {
		type: Array,
		required: true
	}
})

const answerStore = useAnswerStore();
const page = ref(1)

const result = ref({})

const question = computed(() => {
	const clone = JSON.parse(JSON.stringify(props.questionsList))
	const startFrom = page.value - 1 // Adjusting for zero-indexing and possible pagination size
	return clone.splice(startFrom, 1)[0]
})

const onPageChange = (event) => {
	console.log('Page changed:', event)
	page.value = event
}

const selectAnswer = (answer) => {
	// const obj = { [answer.question_id]: answer.id, value: answer.value }
	const obj = { [answer.question_id]: { answer_id: answer.id, value: answer.value }}
	answerStore.addAnswer(obj)
}
</script>
 