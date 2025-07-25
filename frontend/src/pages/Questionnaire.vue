<template>
	<Container>
		<div class="relative">
			<div v-if="answerStore.getQuestionnaireDetails.domain"
				class="absolute font-bold text-orangeLogoDark bg-yellowLogo px-1 rounded w-fit left-6 top-6">
				<div>domaine: <span class="font-extrabold italic">{{
					answerStore.getQuestionnaireDetails.domain }}</span></div>
				<div>niveau: <span class="font-bold italic">{{
					answerStore.getQuestionnaireDetails.button }}</span></div>
			</div>
			<div class="flex flex-col items-center pt-20">
				<div v-if="!questionnaireStarted" class="flex space-x-4 mb-4">
					<div v-for="domain in questionnaireDomain" :key="domain"
						class="rounded-lg bg-gradient-to-r from-blueLogoDark to-blueLogoLight p-4 flex flex-col items-center">
						<div class="bg-blue-100 rounded-md p-2 mb-10 z-10 text-blue-900 text-xl font-extrabold">
							{{ domain }}
						</div>
						<div class="flex h-1/2">
							<button v-for="(button, index) in buttonsQuestionaires" :key="button"
								class=" text-orangeLogo bg-blue-200 hover:text-yellowLogo hover:bg-orangeLogo rounded-lg p-2 disabled:opacity-40 hover:scale-110 transition duration-300"
								:class="{'mr-8': index === 0}"
								:disabled="isDisabled(domain, button)"
								@click="openModal(domain, button)">
								<div>
									<div class="font-extrabold">{{ button }}</div>
									<div class="italic">{{ buttonTextAndApiUrl(domain, button).text }}</div>
									<div v-if="showNextAvailability(domain, button)" class="text-xs italic">Disponible le
										{{ buttonTextAndApiUrl(domain, button).availabilityDate }}</div>
								</div>
							</button>
						</div>
					</div>
				</div>
				<div v-if="questionnaireStarted" class="flex flex-col items-center">
					<div>
						<QuestionAnswerBlock :questionsList="questionsList" />
					</div>
					<button
						class="rounded bg-blueLogoLight p-1 text-blackLogo text-xl flex items-center px-4 mt-12 transition hover:scale-125 duration-300"
						@click="stopQuestionnaire">
						terminer questionnaire
					</button>
					<StopWatch @time-is-up="stopQuestionnaire" class="mt-16" />
				</div>
			</div>
			<StartModal :isVisible="isModalVisible" :title="modalTitle" @close="closeModal">
				<p class="text-xs">Quand vous cliquez sur commencer, le questionnaire démarre et cela compte pour un essai. Si
					vous n'êtes pas
					prêt, fermez cette boite de dialogue.</p>
				<div class="flex space-x-2 justify-center">
					<button @click="closeModal" class="mt-4 bg-red-600 text-white p-2 rounded-lg font-bold">
						fermer
					</button>
					<button @click="startQuestionnaire" class="mt-4 bg-green-600 text-white p-2 rounded-lg font-bold">
						commencer
					</button>
				</div>
			</StartModal>
		</div>
	</Container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useAnswerStore } from '@/stores/modules/answerStore'
import { useScoreStore } from '@/stores/modules/scoreStore'
import { useParamsStore } from '@/stores/modules/paramsStore'
import axios from 'axios'
import QuestionAnswerBlock from "@/components/QuestionAnswerBlock.vue"
import StopWatch from "@/components/StopWatch.vue"
import StartModal from "@/components/StartModal.vue"
import Container from "@/components/Container.vue"

const router = useRouter()
const sessionStore = useSessionStore()
const answerStore = useAnswerStore()
const scoreStore = useScoreStore()
const paramsStore = useParamsStore()
const questionsList = ref([])
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
	if (!paramsStore.getIsLoaded) {
		await paramsStore.fetchParams()
	}
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
	return sessionStore.getUserDetails.admin ? false : isDisabledByTiming(domain) || (buttonTextAndApiUrl(domain, button).text !== 'Non validé')
}

const isDisabledByTiming = (domain) => {
	const score = selectScore(domain)
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
				return score.step >= paramsStore.getParams.numberOfTriesPermitted
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
		isModalVisible.value = false
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
					step: isMoreThanCycleLength ? 1 : score.step + 1,
					try_date: isMoreThanCycleLength ? currentDate : score.try_date
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
		scoreBeingUpdated.value = response.data
	} catch (error) {
		console.error('Error updating score:', error.message);
	}
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
					level: success ? nextLevel : score.level
				}
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			});
	} catch (error) {
		console.error('Error updating score:', error.message);
	}
	await scoreStore.fetchScores()
}

const updateCertification = async (newCertification) => {
	try {
		const userId = sessionStore.getUserId

		await axios.patch(`/api/admin/users/${userId}/update_certification`,
			{
				certification: newCertification
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
	} catch (error) {
		console.error('Error updating certification:', error.message)
	}
}

const stopQuestionnaire = async () => {
	await updateScoreAtFinish(scoreBeingUpdated.value)
	answerStore.addDetails({})
	scoreStore.fetchScores()
	if (scoreStore.getScore.droitNaturel.level === "SA" && scoreStore.getScore.ecoleAutrichienne.level === "SA") {
		await updateCertification('MC')
	}
	sessionStore.loginUserWithToken(localStorage.getItem("authToken"))
	router.push({ name: "Home" })
}

const selectScore = (domain) => {
	return domain === 'Droit Naturel' ? scoreStore.getScore.droitNaturel : scoreStore.getScore.ecoleAutrichienne
}

const closeModal = () => {
	isModalVisible.value = false;
}

const openModal = (domain, button) => {
	if (isModalVisible.value) {
		return;
	}

	selectedDomain.value = domain;
	selectedButton.value = button;
	isModalVisible.value = true;
}

const modalTitle = computed(() => {
	return `${selectedDomain.value}, ${selectedButton.value}`
})
</script>
