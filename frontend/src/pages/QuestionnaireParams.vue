<template>
	<div class="px-24 py-12 bg-neutral-600 min-h-screen flex justify-center">
		<div class="w-1/2">
			<div v-for="(param, index) in parameters" :key="index" class="mb-4">
				<div class="border-2 anarcap-border bg-orange-100 py-2 px-8 rounded flex justify-center w-full">
					<div class="flex flex-col items-center">
						<div>
							{{ param }}
						</div>
						<!-- Conditional rendering for input or textarea -->
						<template v-if="index === 10">
							<textarea rows="4" cols="50" v-model="newValue[index]"
								class="cursor-pointer placeholder:italic bg-orange-200 px-2 rounded"></textarea>
						</template>
						<template v-else>
							<input v-model="newValue[index]"
								class="cursor-pointer border placeholder:italic bg-orange-200 px-2 rounded"></input>
						</template>
					</div>
				</div>
			</div>
			<div
				class="flex bg-orange-300 font-bold hover:bg-orange-400 p-2 border-2 anarcap-border rounded items-center justify-center w-full cursor-pointer"
				@click="updateParams">
				modifier
			</div>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useRouter } from "vue-router"
import { ref, onMounted, computed } from "vue"
import { useParamsStore } from "@/stores/modules/paramsStore"

const sessionStore = useSessionStore();
const storeParams = useParamsStore()
const router = useRouter()

const parameters = ref([
	"période d'essais (nb de jours):",
	"cycle total (nb de jours):",
	"nombre d'essais autorisés:",
	"début du message d'accueuil:",
	"fin du message d'accueuil:",
	"nombre de questions par questionnaire:",
	"durée du questionnaire (en minutes):",
	"moyenne pour questions LOW:",
	"moyenne pour questions MID:",
	"moyenne pour questions HIGH:",
	"text d'introduction:"
])
const newValue = ref([])

onMounted(() => {
	newValue.value[0] = storeParams.getParams.tryLength
	newValue.value[1] = storeParams.getParams.cycleLength
	newValue.value[2] = storeParams.getParams.numberOfTriesPermitted
	newValue.value[3] = storeParams.getParams.welcome_start
	newValue.value[4] = storeParams.getParams.welcome_end
	newValue.value[5] = storeParams.getParams.nb_questions_per_questionnaire
	newValue.value[6] = storeParams.getParams.questionnaire_time_limit
	newValue.value[7] = storeParams.getParams.low_threshold
	newValue.value[8] = storeParams.getParams.mid_threshold
	newValue.value[9] = storeParams.getParams.high_threshold
	newValue.value[10] = storeParams.getParams.intro
})

const newValuesObject = computed(() => {
	return {
		questionnaire_params: {
			try_length: newValue.value[0],
			cycle_length: newValue.value[1],
			tries_permitted: newValue.value[2],
			welcome_start: newValue.value[3],
			welcome_end: newValue.value[4],
			nb_questions_per_questionnaire: newValue.value[5],
			questionnaire_time_limit: newValue.value[6],
			low_threshold: newValue.value[7],
			mid_threshold: newValue.value[8],
			high_threshold: newValue.value[9],
			intro: newValue.value[10]
		}
	}
})

const updateParams = async () => {
	try {
		const response = await axios.put('/api/questionnaire-params', newValuesObject.value, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		});
		if (response.status === 200) {
			router.push({ name: "Home" })
		}
	} catch (error) {
		console.error('Error updating questionnaire params:', error.message);
	}
}
</script>

