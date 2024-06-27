<template>
	<div class="bg-neutral-500 h-full text-black px-12 pt-12">
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
				<Autocomplete :options="filteredQuestions" class="pb-4"/>
				<div v-for="question in filteredQuestions" class="justify-start cursor-pointer">
					{{ truncateQuestion(question.content) }}
				</div>
			</div>
			<div class="bg-red-300 grow h-full">ze question</div>
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
const level = ref('')
const domain = ref('')
const questions = ref([])
const sessionStore = useSessionStore()

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

const add = (target, optionSelected) => {
	if (target === 'domain') { domain.value = optionSelected }
	else { level.value = optionSelected }
}
</script>
