<template>
	<div class="relative h-full text-white pt-12 px-8 bg-gradient-to-b from-black to-blue-900" v-cloak>
		<div class="flex flex-col items-center">
			<div v-if="!questionnaireStarted" class="flex space-x-4 mb-4">
				<div v-for="domain in questionnaireDomain" :key="domain"
					class="rounded-lg bg-blue-300 p-4 flex flex-col items-center">
					<div class="bg-blue-100 rounded-md p-2 mb-10 z-10 text-blue-900 text-xl font-extrabold">
						{{
							domain }}</div>
					<div class="flex space-x-2 h-1/2">
						<button v-for="button in buttonsQuestionaires" :key="button"
							class="bg-blue-900 text-white rounded-lg disabled:opacity-40" @click="startQuestionnaire(domain, button)"
							:disabled="isDisabled(domain, button)">
							<div class="p-2 rounded h-full flex items-center">
								<div>
									<div class="font-extrabold">{{ button }}</div>
									<div class="italic">{{ buttonTextAndApiUrl(domain, button).text }}</div>
									<div v-if="showNextAvailability(domain, button)" class="text-xs italic">Disponible le
										{{ buttonTextAndApiUrl(domain, button).availabilityDate }}</div>
								</div>
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
		apiUrl = `/questions?domain=${domainParam}&level=BA`
	} else {
		text = score.level === 'SA' ? 'Validé' : score.level === 'BA' ? 'Non validé' : "valider 'Bases Acquises' d'abord"
		apiUrl = `/questions?domain=${domainParam}&level=SA`
	}
	return { text, apiUrl, availabilityDate }

}

const showNextAvailability = (domain, button) => {
	return isDisabled(domain, button) && buttonTextAndApiUrl(domain, button).text === 'Non validé'
}

const isDisabled = (domain, button) => {
	return isDisabledByTiming(domain) || (buttonTextAndApiUrl(domain, button).text !== 'Non validé')
}

const isDisabledByTiming = (domain) => {
	const score = selectScore(domain)
	if (score && score.step) {
		const lastTryDate = new Date(score.try_date)

		const isMoreThanCycleLength = (currentDate - lastTryDate) > paramsStore.getParams.cycleLength * 24 * 60 * 60 * 1000;
		const isMoreThanTryLength = (currentDate - lastTryDate) > paramsStore.getParams.tryLength * 24 * 60 * 60 * 1000;
		console.log('currentDate - lastTryDate', currentDate - lastTryDate)
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

async function startQuestionnaire(domain, button) {
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
		console.log('questions =>', response)
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
		const response = await axios.post('/scores',
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
		const response = await axios.patch(`/scores/${score.id}`,
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
	const success = answerStore.getScore >= paramsStore.getParams.succeedThreshold
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
		const response = await axios.patch(`/scores/${score.id}`,
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
</script>
