<template>
	<div class="relative bg-neutral-500 h-full text-white pt-12">
		<div class="flex flex-col items-center">
			<button>
				<div v-if="!questionnaireStarted"
					class="border-8 anarcap-border bg-blue-500 rounded-xl text-white text-5xl p-4 mb-8"
					@click="startQuestionnaire">Commencer le questionnaire
				</div>
			</button>
			<button>
				<div v-if="showNotLoggedInMessage" @click="router.push('/Login')"
					class="text-lg border-4 anarcap-border rounded-lg bg-red-600 w-fit p-2">
					Il faut
					que tu te
					loggues gros bêta !!</div>
			</button>
			<div v-if="questionnaireStarted">
				<QuestionAnswerBlock :questionsList="questionsList" class="shadow-xl"/>
			</div>
			<StopWatch v-if="questionnaireStarted" class="absolute bottom-4" :class="stopWatchClasses" @jump="changeStopWatchClasses"/>
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

const changeStopWatchClasses = () => {
	console.log('GRUUUUUUKaaaaaaah')
	stopWatchClasses.value = stopWatchClasses.value === 'left-4' ? 'right-4' : 'left-4' 
}

async function startQuestionnaire() {
	showNotLoggedInMessage.value = !sessionStore.isLoggedIn
	try {
		const response = await axios.get('/questions',
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
