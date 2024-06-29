<template>
	<div class="bg-neutral-500 h-full text-black flex flex-col items-center justify-center space-y-4 px-12">
		<div class="grid grid-cols-12 gap-4 w-full">
			<div class="border-4 anarcap-border rounded-lg col-span-10">
				<input v-model="question"
					class="placeholder:italic placeholder:text-slate-400 w-full bg-orange-100 p-2 focus:bg-orange-300 hover:bg-orange-200 rounded"
					placeholder="Ecrit ta question avec un point d'intérogation à la fin (sinon c'est pas une question, tu comprends ?)" />
			</div>
			<div v-for="(menuOptions, index) in menuData" :key="index">
				<div class="relative" @mouseover="showMenu(menuOptions.target)" @mouseout="hideMenu(menuOptions.target)">
					<div class="border-4 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.text }}</div>
					<Menu v-show="hovered === menuOptions.target" class="absolute -bottom-13 -left-10 z-10" :options="menuOptions"
						@optionSelected="(optionSelected) => add(menuOptions.target, optionSelected)" />
				</div>
			</div>
			<div
				class="col-span-10 border-4 anarcap-border rounded-lg bg-green-100 flex flex-col divide-y divide-orange-700 divide-solid grow">
				<div v-for="(answer, index) in answers" :key="index">
					<div class="w-full first:rounded-t-lg last:rounded-b-lg">
						<input v-model="answers[index]"
							:class="[answerClasses, { 'rounded-t-lg': index === 0 }, { 'rounded-b-lg': index === answerCount - 1 }]"
							placeholder="Ecris ta réponse sans fotes d'ortograff" />
					</div>
				</div>
			</div>
			<div
				class="border-4 anarcap-border bg-green-100 rounded-lg flex flex-col divide-y divide-orange-700 divide-solid">
				<div v-for="(answerValue, index) in answerValues" :key="index">
					<div class="w-full first:rounded-t-lg last:rounded-b-lg">
						<input v-model="answerValues[index]"
							:class="[answerClasses, { 'rounded-t-lg': index === 0 }, { 'rounded-b-lg': index === answerCount - 1 }]"
							placeholder="Valeur" />
					</div>
				</div>
			</div>
			<div class="h-full flex flex-col">
				<div v-for="index in answerCount" :key="index"
					class="border-4 anarcap-border bg-red-500 rounded-lg h-full flex items-center pl-2 cursor-pointer hover:bg-red-600 hover:font-extrabold hover:text-white"
					@click="deleteItem(index - 1)">
					Supprimer
				</div>
			</div>
		</div>
		<div
			class="border-4 w-1/3 anarcap-border rounded-lg bg-green-600 text-white hover:bg-green-700 hover:font-extrabold cursor-pointer p-2 flex justify-center"
			@click="addItem">
			Rajouter une réponse
		</div>
		<div
			class="border-4 w-1/3 anarcap-border rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:font-extrabold cursor-pointer p-2 flex justify-center"
			@click="createQuestion">
			Envoyer
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import Menu from '../components/Menu.vue'
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const props = defineProps({
	questionToBeEdited: {
		type: Object,
		default: () => ({ answers: Array(5).fill('') })
	}
})

const router = useRouter()
const sessionStore = useSessionStore();
const answerClasses = ref('placeholder:italic placeholder:text-slate-400 w-full p-2 focus:bg-green-300 hover:bg-green-200')
const answerCount = ref(props.questionToBeEdited.answers.length)
const answers = ref(Array(answerCount.value).fill(''))
const answerValues = ref(Array(answerCount.value).fill(undefined))
const question = ref('')
const level = ref('')
const domain = ref('')
const hovered = ref('')

const menuData = [
	{ target: 'domain', text: 'domaine', content: [{ text: 'Ecole Autrichienne', symbol: 'EA' }, { text: 'Droit Naturel', symbol: 'DN' }] },
	{ target: 'level', text: 'niveau', content: [{ text: 'Base Acquises', symbol: 'BA' }, { text: 'Sait Anal-yser', symbol: 'SA' }] }
]

const showMenu = (option) => {
	hovered.value = option
}

const hideMenu = () => {
	hovered.value = ''
}

const add = (target, optionSelected) => {
	console.log('selected1 !!!!!!', target)
	console.log('selected2 !!!!!!', optionSelected)

	if (target === 'domain') { domain.value = optionSelected }
	else { level.value = optionSelected }
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
	try {
		const response = await axios.post('/questions', {
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
			console.log("Question and answers in the database")
			answers.value = Array(answerCount.value).fill('')
			answerValues.value = Array(answerCount.value).fill('')
			question.value = ''
			level.value = undefined
			domain.value = ''
		}
	} catch (error) {
		console.error(`Error creating:`, error);
	}
}

watch(() => props.questionToBeEdited, (newValue) => {
	question.value = newValue.content || ''
	answers.value = newValue.answers.map(answer => answer.content)
	answerValues.value = newValue.answers.map(answer => answer.value)
	answerCount.value = newValue.answers.length
	level.value = newValue.level || ''
	domain.value = newValue.domain || ''
}, {
	deep: true,
	immediate: true
})
</script>