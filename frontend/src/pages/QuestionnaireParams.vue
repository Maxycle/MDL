<template>
	<div class="px-24 pt-12 bg-neutral-600 h-full flex justify-center">
		<div class="w-1/2">
			<div v-for="(param, index) in parameters" :key="index" class="flex justify-between gap-x-4 mb-4">
				<div class="w-full">
					<div class="border-2 anarcap-border bg-orange-100 p-2 rounded">
						{{ param }}
						<!-- Conditional rendering for input or textarea -->
						<template v-if="index === 8">
							<textarea rows="4" cols="50" v-model="newValue[index]"
								class="cursor-pointer placeholder:italic bg-orange-200 px-2 rounded"></textarea>
						</template>
						<template v-else>
							<input v-model="newValue[index]"
								class="cursor-pointer placeholder:italic bg-orange-200 px-2 rounded"></input>
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
import { ref, onMounted, computed } from "vue"
import { useParamsStore } from "@/stores/modules/paramsStore"

const sessionStore = useSessionStore();
const storeParams = useParamsStore()

const parameters = ref([
	"période d'essais (nb de jours):",
	"cycle (nb de jours):",
	"nombre d'essais autorisés:",
	"points à atteindre pour réussir:",
	"début du message d'accueuil:",
	"fin du message d'accueuil:",
	"nombre de questions par questionnaire:",
	"durée du questionnaire (en minutes):",
	"text d'introduction:"
])
const newValue = ref([])

onMounted(() => {
	newValue.value[0] = storeParams.getParams.tryLength
	newValue.value[1] = storeParams.getParams.cycleLength
	newValue.value[2] = storeParams.getParams.numberOfTriesPermitted
	newValue.value[3] = storeParams.getParams.succeedThreshold
	newValue.value[4] = storeParams.getParams.welcome_start
	newValue.value[5] = storeParams.getParams.welcome_end
	newValue.value[6] = storeParams.getParams.nb_questions_per_questionnaire
	newValue.value[7] = storeParams.getParams.questionnaire_time_limit
	newValue.value[8] = storeParams.getParams.intro
})

const newValuesObject = computed(() => {
	return {
		questionnaire_params: {
			try_length: newValue.value[0],
			cycle_length: newValue.value[1],
			tries_permitted: newValue.value[2],
			threshold: newValue.value[3],
			welcome_start: newValue.value[4],
			welcome_end: newValue.value[5],
			nb_questions_per_questionnaire: newValue.value[6],
			questionnaire_time_limit: newValue.value[7],
			intro: newValue.value[8]
		}
	}
})

const updateParams = async () => {
	try {
		const response = await axios.put('/questionnaire-params', newValuesObject.value, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		});
		console.log('Params updated:', response);
	} catch (error) {
		console.error('Error updating questionnaire params:', error.message);
	}
}
</script>
