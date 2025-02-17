<template>
	<div class="bg-neutral-600 h-full text-black flex flex-col items-center justify-center space-y-4 px-12">
		<div class="grid grid-cols-12 gap-6 w-full">
			<div class="border-4 anarcap-border rounded-lg col-span-10">
				<input v-model="question"
					class="placeholder:italic placeholder:text-slate-400 w-full bg-orange-100 p-2 focus:bg-orange-300 hover:bg-orange-200 rounded"
					placeholder="Ecrit ta question avec un point d'intérogation à la fin (sinon c'est pas une question, tu comprends ?)" />
			</div>
			<div v-for="(menuOptions, index) in menuData" :key="index">
				<div class="relative" @mouseover="showMenu(menuOptions.target)" @mouseout="hideMenu(menuOptions.target)">
					<div class="border-4 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.text }}</div>
					<Menu v-show="hovered === menuOptions.target" class="absolute -bottom-13 -left-10 z-10" :options="menuOptions"
						:selectedOption="optionSelected(menuOptions.target)"
						@optionSelected="(optionSelected) => addAttribute(menuOptions.target, optionSelected)" />
				</div>
			</div>
			<div class="col-span-10">
				<div v-for="(answer, index) in answers" :key="index" :class="answerClasses">
					<input v-model="answers[index]" placeholder="Ecris ta réponse sans fotes d'ortograff"
						class="w-full placeholder:italic" />
				</div>
			</div>
			<div>
				<div v-for="(answerValue, index) in answerValues" :key="index" :class="answerClasses">
					<input v-model="answerValues[index]" placeholder="Valeur" class="w-full placeholder:italic" />
				</div>
			</div>
			<div class="">
				<div v-for="index in answerCount" :key="index" class="bg-red-600 edit-button justify-center hover:bg-red-700 mb-1"
					@click="deleteItem(index - 1)">
					Supprimer
				</div>
			</div>
		</div>
		<div class="bg-green-600 hover:bg-green-700 big-edit-button justify-center" @click="addItem">
			Rajouter une réponse
		</div>
		<div class="bg-blue-600 hover:bg-blue-700 big-edit-button justify-center" @click="createQuestion">
			Envoyer
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import Menu from '../components/Menu.vue'
import { ref, watch, onMounted } from "vue"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { menuData } from '@/helpers/constants.js'

const props = defineProps({
	questionToBeEdited: {
		type: Object,
		default: () => ({ answers: Array(5).fill('') })
	},
	isUpdating: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['questions-updated']);
const sessionStore = useSessionStore();
const answerCount = ref(props.questionToBeEdited.answers.length)
const answers = ref(Array(answerCount.value))
const answerValues = ref(Array(answerCount.value))
const answerClasses = ref('edit-button text-black bg-orange-100 hover:bg-orange-200 mb-1')
const question = ref('')
const questionId = ref(undefined)
const level = ref('')
const domain = ref('')
const difficulty = ref('')
const hovered = ref('')

onMounted(() => {
	if (!props.isUpdating) { answerValues.value = [0, 25, 50, 75, 100] }
})

const optionSelected = (target) => {
	const option = target === 'domain' ? domain.value : target === 'level' ? level.value : difficulty.value
	return option
}

const showMenu = (option) => {
	hovered.value = option
}

const hideMenu = () => {
	hovered.value = ''
}

const addAttribute = (target, optionSelected) => {
	if (target === 'domain') { domain.value = optionSelected }
	else if (target === 'level') { level.value = optionSelected }
	else { difficulty.value = optionSelected }
}

const deleteItem = (index) => {
	answers.value.splice(index, 1)
	answerValues.value.splice(index, 1)
	answerCount.value--
}

const addItem = () => {
	answers.value.push('')
	answerValues.value.push(undefined)
	answerCount.value++
}

const createQuestion = async () => {
	if (props.isUpdating) {
		try {
			const responseDelete = await axios.delete(`/api/questions/${questionId.value}`, {
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
		} catch (error) {
			console.error(`Error creating:`, error);
		}
	}

	try {
		const response = await axios.post('/api/questions', {
			question: {
				content: question.value,
				level: level.value,
				domain: domain.value,
				answers_attributes: answers.value.map((content, index) => ({
					content,
					value: answerValues.value[index]
				}))
			}
		},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			}
		);
		if (response.status === 201) {
			("Question and answers in the database")
			answers.value = Array(answerCount.value).fill('')
			answerValues.value = Array(answerCount.value).fill('')
			question.value = ''
			level.value = undefined
			domain.value = ''
		}
	} catch (error) {
		console.error(`Error creating:`, error);
	}
	emit('questions-updated')
}

watch(() => props.questionToBeEdited, (newValue) => {
	question.value = newValue.content || ''
	answers.value = newValue.answers.map(answer => answer.content)
	answerValues.value = newValue.answers.map(answer => answer.value)
	answerCount.value = newValue.answers.length
	level.value = newValue.level || ''
	domain.value = newValue.domain || ''
	difficulty.value = newValue.difficulty || ''
	questionId.value = newValue.id
}, {
	deep: true,
	immediate: true
})
</script>