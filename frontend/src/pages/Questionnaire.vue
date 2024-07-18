<template>
	<div class="relative bg-neutral-500 h-full text-white pt-12 px-8">
		<div class="flex flex-col items-center">
			<div v-if="!questionnaireStarted" class="flex space-x-4 mb-4">
				<div v-for="domain in questionnaireDomain" :key="domain"
					class="border-8 anarcap-border rounded-lg bg-neutral-400 p-4 flex flex-col items-center shadow-xl shadow-neutral-700">
					<div
						class="border-4 border-orange-700 bg-orange-100 rounded-md p-2 mb-10 z-10 text-black text-xl font-extrabold shadow-lg shadow-neutral-700 hover:animate-spin">
						{{
							domain }}</div>
					<div class="flex space-x-2 h-1/2">
						<button v-for="button in buttonsQuestionaires" :key="button"
							class="bg-green-400 text-black disabled:opacity-50" @click="startQuestionnaire(domain, button)"
							:disabled="isDisabled(domain, button)">
							<div class="border-2 anarcap-border p-2 rounded shadow-lg shadow-neutral-700 h-full flex items-center">
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
			<div class="absolute bottom-4" :class="stopWatchClasses">
				<StopWatch v-if="questionnaireStarted" @jump="changeStopWatchClasses" @time-is-up="stopQuestionnaire" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useAnswerStore } from '@/stores/modules/answerStore';
import axios from 'axios'
import QuestionAnswerBlock from "@/components/QuestionAnswerBlock.vue"
import StopWatch from "@/components/StopWatch.vue"

const router = useRouter()
const sessionStore = useSessionStore()
const answerStore = useAnswerStore()

const questionsList = ref([])
const showNotLoggedInMessage = ref(false)
const questionnaireStarted = ref(false)
const stopWatchClasses = ref('left-4')
const buttonsQuestionaires = ['Bases Acquises', 'Sait Analyser']
const questionnaireDomain = ['Droit Naturel', 'Ecole Autrichienne']
const scores = ref([])
const scoreDroitNaturel = ref({})
const scoreEcoleAutrichienne = ref({})
const scoreBeingUpdated = ref({})
const cycleLength = ref(0)
const tryLength = ref(0)
const succeedThreshold = ref(0)
const numberOfTriesPermitted = ref(0)
const currentDate = new Date()
const questionnaireParams = ref({})

onMounted(async () => {
	try {
		const response = await axios.get('/questionnaire-params',
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		questionnaireParams.value = response.data
		cycleLength.value = response.data[0].cycle_length * 24 * 60 * 60 * 1000
		tryLength.value = response.data[0].try_length * 24 * 60 * 60 * 1000
		numberOfTriesPermitted.value = response.data[0].tries_permitted
		succeedThreshold.value = response.data[0].threshold
	} catch (error) {
		console.error('Error fetching questionnaire params:', error.message);
	}

	await fetchScores()
})

const changeStopWatchClasses = () => {
	stopWatchClasses.value = stopWatchClasses.value === 'left-4' ? 'right-4 top-4' : 'left-4'
}

const fetchScores = async () => {
	try {
		const response = await axios.get(`/uzer-scores?user_id=${sessionStore.getUserId}`,
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		scores.value = response.data;
		console.log('fetchScores =>', response)
	} catch (error) {
		console.error('Error fetching scores:', error.message);
	}
	scoreDroitNaturel.value = scores.value.find(obj => obj.domain === 'Droit Naturel') || {}
	scoreEcoleAutrichienne.value = scores.value.find(obj => obj.domain === 'Ecole Autrichienne') || {}
}

const buttonTextAndApiUrl = (domain, button) => {
	let domainParam = domain === 'Droit Naturel' ? 'DN' : 'EA'
	let score = domain === 'Droit Naturel' ? scoreDroitNaturel.value : scoreEcoleAutrichienne.value
	let text = ''
	let apiUrl = ''
	let lastTryDate = new Date(score.try_date)
	let availabilityDate = new Date(lastTryDate.getTime() + cycleLength.value).toDateString();

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
	const score = scores.value.find(obj => obj.domain === domain)

	if (score && score.step > 0) {
		const lastTryDate = new Date(score.try_date)

		const isMoreThanCycleLength = (currentDate - lastTryDate) > cycleLength.value;
		const isMoreThanTryLength = (currentDate - lastTryDate) > tryLength.value;
		if (isMoreThanCycleLength) {
			return false
		} else {
			if (isMoreThanTryLength) {
				return true
			} else {
				return score.step >= numberOfTriesPermitted.value - 1
			}
		}
	}
	return false
}

async function startQuestionnaire(domain, button) {
	showNotLoggedInMessage.value = !sessionStore.isLoggedIn
	answerStore.reset()
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
		scoreBeingUpdated.value = domain === 'Droit Naturel' ? scoreDroitNaturel.value : scoreEcoleAutrichienne.value
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
					domain: domain
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		console.log('score =>', response)
	} catch (error) {
		console.error('Error creating score:', error.message);
	}
	await fetchScores()
	scoreBeingUpdated.value = domain === 'Droit Naturel' ? scoreDroitNaturel.value : scoreEcoleAutrichienne.value
}

const updateScoreAtStart = async (score) => {
	const lastTryDate = new Date(score.try_date)
	const isMoreThanCycleLength = (currentDate - lastTryDate) > cycleLength.value;
	console.log('ze steps', score.step >= numberOfTriesPermitted.value ? 0 : score.step + 1)
	try {
		const response = await axios.patch(`/scores/${score.id}`,
			{
				score: {
					step: score.step >= numberOfTriesPermitted.value ? 0 : score.step + 1,
					try_date: isMoreThanCycleLength ? currentDate : score.try_date
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		console.log('update ze score =>', response)
	} catch (error) {
		console.error('Error creating score:', error.message);
	}
	await fetchScores()
	scoreBeingUpdated.value = score.domain === 'Droit Naturel' ? scoreDroitNaturel.value : scoreEcoleAutrichienne.value
}

const updateScoreAtFinish = async (score) => {
	const success = answerStore.getScore >= succeedThreshold.value
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
		console.log('update ze score =>', response)
	} catch (error) {
		console.error('Error creating score:', error.message);
	}
	await fetchScores()
}


const stopQuestionnaire = () => {
	console.log('questionnaire time up !!!!')
	updateScoreAtFinish(scoreBeingUpdated.value)
}
</script>
