<template>
	<div class="px-24 py-12 bg-neutral-600 min-h-screen flex justify-center">
		<div class="w-1/2">
			<div v-for="(param, index) in parameters" :key="index" class="mb-4">
				<!-- Skip rendering individual containers for indices 7, 8, 9 -->
				<template v-if="index < 7 || index > 9">
					<div class="border-2 anarcap-border bg-orange-100 py-2 px-8 rounded flex justify-center w-full">
						<div class="flex flex-col items-center">
							<div>
								{{ param.label }}
							</div>
							<div class="text-xs pb-2">({{ param.explanation }})</div>
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
				</template>

				<!-- Special horizontal container for indices 7, 8, 9 -->
				<template v-if="index === 7">
					<div class="border-2 anarcap-border bg-orange-100 py-2 px-8 rounded flex justify-center w-full">
						<div>
							<div class="text-center">moyennes à atteindre pour chaque niveau de difficulté de questions</div>
							<div class="flex flex-row gap-6 items-center">
								<div v-for="thresholdIndex in [7, 8, 9]" :key="thresholdIndex" class="flex flex-col items-center">
									<div class="text-center text-xs pb-2">
										{{ parameters[thresholdIndex].label }}
									</div>
									<input v-model="newValue[thresholdIndex]"
										class="cursor-pointer border placeholder:italic bg-orange-200 px-2 rounded w-24">
								</div>
							</div>
						</div>
					</div>
				</template>
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
	{ label: "période d'essais:", explanation: "nombre de jours pendant lesquels un membre peut ré-essayer le questionnaire (s'il a échoué)" },
	{ label: "cycle total:", explanation: "nombre de jours à attendre pour pouvoir repasser le questionnaire et recommencer à zéro (en cas d'echec pendant la période d'essais)" },
	{ label: "nombre d'essais autorisés:", explanation: "nombre d'essais autorisés pendant la période d'essais" },
	{ label: "début du message d'accueil:", explanation: "dans la barre de navigation, <début du message d'accueil> username <fin du message d'accueil>" },
	{ label: "fin du message d'accueil:", explanation: "dans la barre de navigation, <début du message d'accueil> username <fin du message d'accueil>" },
	{ label: "nombre de questions par questionnaire:", explanation: "nombre de questions demandées au membre pour accéder au niveau supérieur" },
	{ label: "durée du questionnaire (en minutes):", explanation: "durée après laquelle le questionnaire s'arrête automatiquement" },
	{ label: "moyenne pour questions LOW:", explanation: "" },
	{ label: "moyenne pour questions MID:", explanation: "" },
	{ label: "moyenne pour questions HIGH:", explanation: "" },
	{ label: "text d'introduction:", explanation: "text présent sur la page personnelle \"mes résultats\", au dessus des scores aux questionnaires" }
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
			console.log('Before fetchParams:', storeParams.getParams); 
			await storeParams.fetchParams()
			console.log('After fetchParams:', storeParams.getParams); 
			router.push({ name: "Home" })
		}
	} catch (error) {
		console.error('Error updating questionnaire params:', error.message);
	}
}
</script>
