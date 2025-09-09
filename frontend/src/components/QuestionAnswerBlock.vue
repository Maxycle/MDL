<template>
	<div class="grid grid-cols-12 place-content-center text-yellowLogo px-4">
		<button v-if="page > 1" class="transition hover:scale-125 duration-300">
			<div
				class="font-extrabold text-xl rounded-lg flex items-center justify-center p-4 text-blackLogo bg-blueLogoLight"
				@click="goToPreviousPage">
				<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 sm:h-12 mx-4 z-10" />
			</div>
		</button>
		<div class="col-span-10 lg:px-8">
			<div class="mb-6">
				<div class="flex items-center">
					<div v-if="sessionStore.isAdmin && question" class="mr-4">difficulté: {{ question.difficulty }}</div>
					<Question :text="question.content"
						class="my-4 sm:my-8 text-lg md:text-3xl lg:text-5xl font-bold text-center" />
				</div>
				<div v-for="(answer, indexAnswer) in answers" :key="indexAnswer">
					<div class="flex items-center">
						<div v-if="sessionStore.isAdmin" class="mr-4">points: {{ answer.value }}</div>
						<Answer :data="answer" @click="selectAnswer(answer)" class="" />
					</div>
				</div>
			</div>
			<v-pagination v-model="page" :length="questionsList.length" :total-visible="5" prev-icon="mdi-menu-left"
				class="text-orangeLogo" next-icon="mdi-menu-right" @page="onPageChange"></v-pagination>
		</div>
		<button v-if="page < questionsList.length" class="transition hover:scale-125 duration-300">
			<div
				class="font-extrabold text-xl rounded-lg flex items-center justify-center p-4 text-blackLogo bg-blueLogoLight"
				@click="goToNextPage">
				<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 sm:h-12 mx-4 z-10 rotate-180" />

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