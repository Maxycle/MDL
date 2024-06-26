<template>
	<div class="bg-neutral-500 h-full text-black flex flex-col items-center justify-center space-y-4 px-12">
		<div class="w-full flex space-x-2">
			<div class="border-2 anarcap-border rounded-lg grow">
				<input v-model="question"
					class="rounded-lg placeholder:italic placeholder:text-slate-400 w-full bg-orange-100 p-2 focus:bg-orange-300 hover:bg-orange-200"
					placeholder="Ecrit ta question avec un point d'intérogation à la fin (sinon c'est pas une question, tu comprends ?)" />
			</div>
			<div v-for="(menuOptions, index) in menuData" :key="index">
				<div class="relative" @mouseover="showMenu(menuOptions.target)" @mouseout="hideMenu(menuOptions.target)">
					<div class="border-2 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.target }}</div>
					<Menu v-show="hovered === menuOptions.target" class="absolute -bottom-13 left-0 z-10"
						:options="menuOptions.content"
						@optionSelected="(optionSelected) => add(menuOptions.target, optionSelected)" />
				</div>
			</div>
		</div>
		<div class="flex space-x-2 w-full ">
			<div class="border-2 anarcap-border rounded-lg bg-green-100 flex flex-col divide-y divide-orange-700 divide-solid grow">
				<div v-for="(answer, index) in answers" :key="index">
					<div class="w-full flex space-x-2 first:rounded-t-lg last:rounded-b-lg">
						<input v-model="answers[index]"
							:class="[answerClasses, { 'rounded-t-lg': index === 0 }, { 'rounded-b-lg': index === answerCount - 1 }]"
							placeholder="Ecris ta réponse sans fotes d'ortograff" />
					</div>
				</div>
			</div>
			<div class="border-2 anarcap-border bg-green-100 rounded-lg flex flex-col divide-y divide-orange-700 divide-solid">
				<div v-for="(answerValue, index) in answerValues" :key="index">
					<div class="w-full flex space-x-2 first:rounded-t-lg last:rounded-b-lg">
						<input v-model="answerValues[index]"
							:class="[answerClasses, { 'rounded-t-lg': index === 0 }, { 'rounded-b-lg': index === answerCount - 1 }]"
							placeholder="Valeur" />
					</div>
				</div>
			</div>
		</div>
		<div
			class="border-2 w-1/3 anarcap-border rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer p-2 flex justify-center"
			@click="createQuestion">
			Envoyer</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import Menu from '../components/Menu.vue'
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
const sessionStore = useSessionStore();
const answerClasses = ref('placeholder:italic placeholder:text-slate-400 w-full p-2 focus:bg-green-300 hover:bg-green-200')
const answerCount = ref(5)
const answers = ref(Array(answerCount.value).fill(''))
const answerValues = ref(Array(answerCount.value).fill(''))
const question = ref('')
const level = ref('')
const domain = ref('')
const hovered = ref('')

const menuData = [
	{ target: 'domain', content: ['Ecole Autrichienne', 'Droit Naturel'] },
	{ target: 'level', content: ['Base Acquises', 'Sait Anal-yser'] }
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

const createQuestion = async () => {
	try {
		const response = await axios.post('/questions', {
			question: {
				content: question.value,
				level: level.value,
				domain: domain.value
			}
		},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			}
		);
	} catch (error) {
		console.error(`Error creating:`, error);
	}
}

</script>
