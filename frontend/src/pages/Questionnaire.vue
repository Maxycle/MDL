<template>
	<div class="relative bg-neutral-500 h-full text-white pt-12 px-8">
		<div class="flex flex-col items-center">
			<div v-if="!questionnaireStarted" class="flex space-x-4 mb-4">
				<div v-for="domain in questionnaireDomain" :key="domain"
					class="border-4 anarcap-border rounded-lg bg-neutral-400 p-4 flex flex-col items-center">
					<div class="border-4 border-orange-700 bg-orange-100 rounded-md p-2 mb-4 text-black text-xl font-extrabold">{{
						domain }}</div>
					<div class="flex space-x-2">
						<button v-for="button in buttonsQuestionaires" :key="button" class="bg-green-400 text-black mb-2"
							@click="startQuestionnaire(domain, button)"
							:class="{ 'bg-red-500': buttonTextAndApiUrl(domain, button).text === 'valider \'Bases Acquises\' d\'abord' }"
							:disabled="buttonTextAndApiUrl(domain, button).text === 'valider \'Bases Acquises\' d\'abord'">
							<div class="border-2 anarcap-border p-2 rounded">
								<div class="font-extrabold">{{ button }}</div>
								<div class="italic">{{ buttonTextAndApiUrl(domain, button).text }}</div>
							</div>
						</button>
					</div>
				</div>
			</div>
			<button>
				<div v-if="showNotLoggedInMessage" @click="router.push('/Login')"
					class="text-lg border-4 anarcap-border rounded-lg bg-red-600 w-fit p-2">
					Il faut
					que tu te
					loggues gros bêta !!</div>
			</button>
			<div v-if="questionnaireStarted">
				<QuestionAnswerBlock :questionsList="questionsList" class="shadow-xl" />
			</div>
			<div class="absolute bottom-4" :class="stopWatchClasses">
				<StopWatch v-if="questionnaireStarted" @jump="changeStopWatchClasses" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import axios from 'axios'
import QuestionAnswerBlock from "@/components/QuestionAnswerBlock.vue"
import StopWatch from "@/components/StopWatch.vue"

const router = useRouter()
const sessionStore = useSessionStore();
const questionsList = ref([])
const showNotLoggedInMessage = ref(false)
const questionnaireStarted = ref(false)
const stopWatchClasses = ref('left-4')
const buttonsQuestionaires = ['Bases Acquises', 'Sait Analyser']
const questionnaireDomain = ['Droit Naturel', 'Ecole Autrichienne']

const changeStopWatchClasses = () => {
	stopWatchClasses.value = stopWatchClasses.value === 'left-4' ? 'right-4 top-4' : 'left-4'
}

const buttonTextAndApiUrl = (domain, button) => {
	let text = ''
	let apiUrl = ''
	switch (domain) {
		case 'Droit Naturel':
			if (button === 'Bases Acquises') {
				text = (sessionStore.DN === 'BA' || sessionStore.DN === 'SA') ? 'Validé' : 'Non validé, questionnaire disponible'
				apiUrl = '/questions?domain=DN&level=BA'
			} else {
				text = sessionStore.DN === 'SA' ? 'Validé' : sessionStore.DN === 'BA' ? 'questionnaire disponible' : "valider 'Bases Acquises' d'abord"
				apiUrl = '/questions?domain=DN&level=SA'
			}
			break
		case 'Ecole Autrichienne':
			if (button === 'Bases Acquises') {
				text = (sessionStore.EA === 'BA' || sessionStore.EA === 'SA') ? 'Validé' : 'Non validé, questionnaire disponible'
				apiUrl = '/questions?domain=EA&level=BA'
			} else {
				text = sessionStore.EA === 'SA' ? 'Validé' : sessionStore.EA === 'BA' ? 'questionnaire disponible' : "valider 'Bases Acquises' d'abord"
				apiUrl = '/questions?domain=EA&level=SA'
			}
			break
	}
	return { text, apiUrl }
}

async function startQuestionnaire(domain, button) {
	showNotLoggedInMessage.value = !sessionStore.isLoggedIn
	try {
		const response = await axios.get(buttonTextAndApiUrl(domain, button).apiUrl,
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		questionsList.value = response.data;
		console.log('questions =>', response)
	} catch (error) {
		console.error('Error fetching questions:', error.message);
	}
	if (questionsList.value.length) {
		questionnaireStarted.value = true
	}
}
</script>
