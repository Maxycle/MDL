<template>
	<div class="relative min-h-screen text-white pt-12 px-8 bg-gradient-to-b from-black to-blue-900" v-cloak>
		<div class="flex flex-col items-center">
			<div v-if="!questionnaireStarted" class="flex space-x-4 mb-4">
				<div v-for="domain in questionnaireDomain" :key="domain"
					class="rounded-lg bg-blue-300 p-4 flex flex-col items-center">
					<div class="bg-blue-100 rounded-md p-2 mb-10 z-10 text-blue-900 text-xl font-extrabold">
						{{
							domain }}</div>
					<div class="flex h-1/2">
						<button v-for="(button, index) in buttonsQuestionaires" :key="button"
							class="bg-blue-900 text-white rounded-lg disabled:opacity-40" :class="{ 'mr-2': index === 0 }"
							@click="openModal(domain, button)" :disabled="isDisabled(domain, button)">
							<div class="p-2 rounded h-full flex items-center">
								<div>
									<div class="font-extrabold">{{ button }}</div>
									<div class="italic">{{ buttonTextAndApiUrl(domain, button).text }}</div>
									<div v-if="showNextAvailability(domain, button)" class="text-xs italic">Disponible le
										{{ buttonTextAndApiUrl(domain, button).availabilityDate }}</div>
								</div>
							</div>
							<StartModal :isVisible="isModalVisible" title="Le questionnaire va commencer" @close="closeModal"
								class="cursor-default">
								<p>Attention les gars ça va commencer, faites pas les cons, ya un temps limite et une fois que ça a
									commencé, ça compte pour un coup !! Et ya que 2 ou 3 coups possibles pendant une semaine alors hein,
									déconnez pas. Une fois que le questionnaire est lancé c'est pas le moment d'aller chercher un kebab
									(avec salade ET oignons) ou d'aller faire caca. Sauf si vous avez la diahrrrrrrée.</p>
								<div class="flex space-x-2 justify-center">
									<button @click="closeModal" class="mt-4 bg-red-600 text-white p-2 rounded-lg font-bold">
										fermer
									</button>
									<button @click="startQuestionnaire(domain, button)"
										class="mt-4 bg-green-600 text-white p-2 rounded-lg font-bold">
										commencer
									</button>
								</div>
							</StartModal>
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
				<QuestionAnswerBlock :questionsList="questionsList" />
			</div>
			<StopWatch v-if="questionnaireStarted" @time-is-up="stopQuestionnaire" class="mt-16" />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useAnswerStore } from '@/stores/modules/answerStore'
import { useScoreStore } from '@/stores/modules/scoreStore'
import { useParamsStore } from '@/stores/modules/paramsStore'
import axios from 'axios'
import QuestionAnswerBlock from "@/components/QuestionAnswerBlock.vue"
import StopWatch from "@/components/StopWatch.vue"
import StartModal from "@/components/StartModal.vue"

const router = useRouter()
const sessionStore = useSessionStore()
const answerStore = useAnswerStore()
const scoreStore = useScoreStore()
const paramsStore = useParamsStore()
const questionsList = ref([])
const showNotLoggedInMessage = ref(false)
const questionnaireStarted = ref(false)
const buttonsQuestionaires = ['Bases Acquises', 'Sait Analyser']
const questionnaireDomain = ['Droit Naturel', 'Ecole Autrichienne']
const scoreBeingUpdated = ref({})
const currentDate = new Date()
const isModalVisible = ref(false)
const selectedDomain = ref(null)
const selectedButton = ref(null)
const difficultyOrder = { LOW: 1, MID: 2, HIGH: 3 }

onMounted(async () => {
	await scoreStore.fetchScores()
})

const buttonTextAndApiUrl = (domain, button) => {
	let domainParam = domain === 'Droit Naturel' ? 'DN' : 'EA'

	let score = selectScore(domain)
	if (!score) {
		return { text: 'Non disponible', apiUrl: '', availabilityDate: '' }
	}
	let text = ''
	let apiUrl = ''
	const lastTryDate = new Date(score.try_date)
	let availabilityDate = new Date(lastTryDate.getTime() + paramsStore.getParams.cycleLength * 24 * 60 * 60 * 1000).toDateString();

	if (button === 'Bases Acquises') {
		text = (score.level === 'BA' || score.level === 'SA') ? 'Validé' : 'Non validé'
		apiUrl = `/api/questions?domain=${domainParam}&level=BA`
	} else {
		text = score.level === 'SA' ? 'Validé' : score.level === 'BA' ? 'Non validé' : "valider 'Bases Acquises' d'abord"
		apiUrl = `/api/questions?domain=${domainParam}&level=SA`
	}
	return { text, apiUrl, availabilityDate }
}

const showNextAvailability = (domain, button) => {
	return isDisabled(domain, button) && buttonTextAndApiUrl(domain, button).text === 'Non validé'
}

const isDisabled = (domain, button) => {
	console.log('isDisabledddddddddddddddd')

	return sessionStore.getUserDetails.admin ? false : isDisabledByTiming(domain) || (buttonTextAndApiUrl(domain, button).text !== 'Non validé')
}

const isDisabledByTiming = (domain) => {
	const score = selectScore(domain)
	console.log('ze score', score)
	if (score && score.step) {
		const lastTryDate = new Date(score.try_date)
		const isMoreThanCycleLength = (currentDate - lastTryDate) > paramsStore.getParams.cycleLength * 24 * 60 * 60 * 1000;
		const isMoreThanTryLength = (currentDate - lastTryDate) > paramsStore.getParams.tryLength * 24 * 60 * 60 * 1000;
		if (isMoreThanCycleLength) {
			return false
		} else {
			if (isMoreThanTryLength) {
				return true
			} else {
				return score.step >= paramsStore.getParams.numberOfTriesPermitted - 1
			}
		}
	}
	return false
}

async function startQuestionnaire() {
	const domain = selectedDomain.value
	const button = selectedButton.value
	answerStore.addDetails({ domain, button })
	questionsList.value = []
	showNotLoggedInMessage.value = !sessionStore.isLoggedIn
	answerStore.reset()
	try {
		const response = await axios.get(buttonTextAndApiUrl(domain, button).apiUrl,
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		questionsList.value = response.data

		questionsList.value.sort((a, b) => {
			return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
		})
	} catch (error) {
		console.error('Error fetching questions:', error.message);
	}
	if (questionsList.value.length) {
		questionnaireStarted.value = true
		scoreBeingUpdated.value = selectScore(domain)

		if (!scoreBeingUpdated.value.id) {
			await createScore(domain)
		} else {
			await updateScoreAtStart(scoreBeingUpdated.value)
		}
	}
}

const createScore = async (domain) => {
	try {
		const response = await axios.post('/api/scores',
			{
				score: {
					user_id: sessionStore.getUserId,
					domain: domain === 'Droit Naturel' ? 'DN' : 'EA'
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		scoreBeingUpdated.value = response.data
	} catch (error) {
		console.error('Error creating score:', error.message);
	}
}

const updateScoreAtStart = async (score) => {
	const lastTryDate = new Date(score.try_date)
	const isMoreThanCycleLength = (currentDate - lastTryDate) > paramsStore.getParams.cycleLength * 24 * 60 * 60 * 1000;
	try {
		const response = await axios.patch(`/api/scores/${score.id}`,
			{
				score: {
					step: score.step >= paramsStore.getParams.numberOfTriesPermitted ? 0 : score.step + 1,
					try_date: isMoreThanCycleLength ? currentDate : score.try_date
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		scoreBeingUpdated.value = response.data
		console.log('response', response)
	} catch (error) {
		console.error('Error creating score:', error.message);
	}
	console.log('scoreBeingUpdated.value', scoreBeingUpdated.value)
}

const updateScoreAtFinish = async (score) => {
	const success = answerStore.isSuccessful
	let nextLevel = ''
	switch (score.level) {
		case 'beginner':
			nextLevel = 'BA'
			break
		case 'BA':
			nextLevel = 'SA'
			break
	}
	try {
		const response = await axios.patch(`/api/scores/${score.id}`,
			{
				score: {
					level: success ? nextLevel : score.level,
					step: success ? -1 : score.step,
					try_date: success ? currentDate : score.try_date
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
	} catch (error) {
		console.error('Error creating score:', error.message);
	}
	await scoreStore.fetchScores()
}

const stopQuestionnaire = () => {
	updateScoreAtFinish(scoreBeingUpdated.value)
	answerStore.addDetails({})
	router.push({ name: "Home" })
}

const selectScore = (domain) => { return domain === 'Droit Naturel' ? scoreStore.getScore.droitNaturel : scoreStore.getScore.ecoleAutrichienne }

const closeModal = (event) => {
	if (event) {
		event.stopPropagation();
	}

	try {
		console.log('closeModal');
		isModalVisible.value = false;

		console.log('Modal visibility status after closing:', isModalVisible.value);
	} catch (error) {
		console.error('Error in closeModal:', error.message);
	}
};

const openModal = (domain, button) => {
	if (isModalVisible.value) {
		console.log('Modal is already open, ignoring openModal call');
		return;
	}

	try {
		selectedDomain.value = domain;
		selectedButton.value = button;
		isModalVisible.value = true;

		console.log('Modal visibility status after opening:', isModalVisible.value);
	} catch (error) {
		console.error('Error in openModal:', error.message);
	}
};

</script>
