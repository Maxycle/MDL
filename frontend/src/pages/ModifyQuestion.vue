<template>
	<div class="h-full text-black px-12 pt-12 bg-gradient-to-r from-neutral-300 to-neutral-600">
		<div class="flex justify-start">
			<div class="grid">
				<div class="flex space-x-4 justify-center pb-4">
					<div v-for="(menuOptions, index) in menuData" :key="index" class="">
						<div class="relative" @mouseover="showMenu(menuOptions.target)" @mouseout="hideMenu(menuOptions.target)">
							<div class="border-4 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.target }}</div>
							<Menu v-show="hovered === menuOptions.target" class="absolute -bottom-13 -left-10 z-10"
								:options="menuOptions" @optionSelected="(optionSelected) => add(menuOptions.target, optionSelected)" />
						</div>
					</div>
				</div>
				<Autocomplete :options="filteredQuestions" class="pb-4" @questiton-selected="selectQuestion" />
				<div v-for="(question, index) in filteredQuestions"
					class="relative justify-start cursor-pointer text-blue-900 underline" @click="selectQuestion(question)"
					@mouseover="showQuestion(index)" @mouseout="hideQuestion(index)">
					{{ truncateQuestion(question.content) }}
					<div v-if="questionToShow === index" @click="selectQuestion(question)"
						class="border-2 border-orange-500 rounded p-1 absolute top-2 left-6 text-nowrap bg-orange-100 z-10">{{
							question.content }}</div>
				</div>
			</div>
			<QuestionEdit v-if="questionSelected.answers" :questionToBeEdited="questionSelected" isUpdating class="bg-transparent" @questions-updated="fetchQuestions"/>
			<div v-else class="w-full flex justify-center mt-12">
				<div class="flex items-center h-fit">
					<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-12 mr-4" />
					<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-12 mr-4" />
					<font-awesome-icon icon="fa-solid fa-arrow-left" class="h-12 mr-4" />
					<div class="border-4 anarcap-border rounded-lg bg-green-700 p-4 w-fit h-fit text-white">Choisis une question
						(à gauche)</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import QuestionEdit from '@/components/QuestionEdit.vue'
import Autocomplete from '@/components/Autocomplete.vue';
import { ref, onMounted, computed } from "vue"
import Menu from '../components/Menu.vue'
import { useSessionStore } from '@/stores/modules/sessionStore'
import truncate from 'lodash/truncate'

const menuData = [
	{ target: 'domain', content: [{ text: 'Ecole Autrichienne', symbol: 'EA' }, { text: 'Droit Naturel', symbol: 'DN' }] },
	{ target: 'level', content: [{ text: 'Base Acquises', symbol: 'BA' }, { text: 'Sait Anal-yser', symbol: 'SA' }] }
]
const hovered = ref('')
const questionToShow = ref(undefined)
const level = ref('')
const domain = ref('')
const questions = ref([])
const sessionStore = useSessionStore()
const questionSelected = ref({});

const selectQuestion = (question) => {
	console.log('selectQuestion', question)
	questionSelected.value = question;
}

onMounted(() => {
	fetchQuestions();
});

const filteredQuestions = computed(() => {
	return questions.value.filter((question) => {
		return (!domain.value || question.domain === domain.value) && (!level.value || question.level === level.value)
	})
})

const truncateQuestion = (string) => {
	return truncate(string, {
		'length': 28,
		'omission': '...'
	})
}

const fetchQuestions = async () => {
	try {
		const response = await axios.get('/questions', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		questions.value = response.data
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const showMenu = (option) => {
	hovered.value = option
}

const hideMenu = () => {
	hovered.value = ''
}

const showQuestion = (index) => {
	questionToShow.value = index
}

const hideQuestion = () => {
	questionToShow.value = undefined
}


const add = (target, optionSelected) => {
	if (target === 'domain') { domain.value = optionSelected }
	else { level.value = optionSelected }
}
</script>
