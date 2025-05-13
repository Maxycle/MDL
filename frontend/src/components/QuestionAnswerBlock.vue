<template>
	<div class="relative text-yellowLogo">
		<div class="flex flex-col items-center mb-6">
			<div class="flex items-center">
				<div v-if="sessionStore.isAdmin && question" class="mr-4">difficulté: {{ question.difficulty }}</div>
				<Question :text="question.content" class="my-8 text-3xl font-bold max-w-7xl text-center" />
			</div>
			<div class="">
				<div v-for="(answer, indexAnswer) in answers" :key="indexAnswer">
					<div class="flex items-center">
						<div v-if="sessionStore.isAdmin" class="mr-4">points: {{ answer.value }}</div>
						<Answer :data="answer" @click="selectAnswer(answer)" class="max-w-7xl"/>
					</div>
				</div>
			</div>
		</div>
		<v-pagination v-model="page" :length="questionsList.length" :total-visible="5" prev-icon="mdi-menu-left" class="text-orangeLogo"
			next-icon="mdi-menu-right" @page="onPageChange"></v-pagination>

		<button  v-if="page < questionsList.length" class="absolute -right-28 bottom-36 transition hover:scale-125 duration-300">
			<div
				class="font-extrabold text-xl rounded-lg flex items-center justify-center p-4 w-24 text-blackLogo bg-blueLogoLight"
				@click="goToNextPage">
				<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-12 mx-4 z-10 rotate-180" />
				
			</div>
		</button>

		<button v-if="page > 1" class="absolute -left-28 bottom-36 transition hover:scale-125 duration-300">
			<div
				class="font-extrabold text-xl rounded-lg flex items-center justify-center p-4 w-24 text-blackLogo bg-blueLogoLight"
				@click="goToPreviousPage">
				<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-12 mx-4 z-10" />
				
			</div>
		</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnswerStore } from '@/stores/modules/answerStore';
import { useSessionStore } from "@/stores/modules/sessionStore"
import Question from './Question.vue'
import Answer from './Answer.vue'

const props = defineProps({
	questionsList: {
		type: Array,
		required: true
	}
})

const answerStore = useAnswerStore()
const sessionStore = useSessionStore()
const page = ref(1)

const question = computed(() => {
	const clone = JSON.parse(JSON.stringify(props.questionsList))
	const startFrom = page.value - 1 // Adjusting for zero-indexing and possible pagination size
	return clone.splice(startFrom, 1)[0]
})

const answers = computed(() => {
	return question.value.answers.sort(function (a, b) {
		return Math.random() - 0.5;
	})
})

const onPageChange = (event) => {
	page.value = event
}

const selectAnswer = (answer) => {
	const obj = { [answer.question_id]: { answer_id: answer.id, value: answer.value, question_difficulty: question.value.difficulty } }
	answerStore.addAnswer(obj)
}

const goToNextPage = () => {
	if (page.value < props.questionsList.length) {
		page.value += 1;
	}
}

const goToPreviousPage = () => {
	if (page.value > 1) {
		page.value -= 1;
	}
}
</script>