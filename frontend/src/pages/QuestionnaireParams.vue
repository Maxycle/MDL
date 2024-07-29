<template>
	<div class="px-24 pt-12 bg-neutral-600 h-full flex justify-center">
		<div class="w-1/2">
			<div v-for="(param, index) in parameters" :key="index" class="flex justify-between mb-4">
				<div class="border-2 anarcap-border bg-orange-100 p-2 w-fit rounded">{{ param.text }}: {{ param.value }}</div>
				<div class="flex gap-x-4">
					<div class="border-2 anarcap-border bg-orange-100 p-2 w-fit rounded">
						Nouvelle valeur: <input :placeholder="existingValues[index]" v-model="newValue[index]"
							class="cursor-pointer placeholder:italic"></input>
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
import AnarcapButton from '../components/buttons/AnarcapButton.vue';
import NavBarButton from '../components/buttons/AnarcapButton.vue';

const sessionStore = useSessionStore();

const parameters = ref([])
const newValue = ref(Array(4).fill(''))
const existingValues = ref(Array(4).fill(''))

onMounted(async () => {
	await fetchParams()
})

const fetchParams = async () => {
	try {
		const response = await axios.get('/questionnaire-params', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		});
		existingValues.value[0] = response.data[0].try_length
		existingValues.value[1] = response.data[0].cycle_length
		existingValues.value[2] = response.data[0].tries_permitted
		existingValues.value[3] = response.data[0].threshold

		parameters.value = [
			{ text: "période d'essais (nb de jours)", value: existingValues.value[0] },
			{ text: "cycle (nb de jours)", value: existingValues.value[1] },
			{ text: "nombre d'essais autorisés", value: existingValues.value[2] },
			{ text: "points à atteindre pour réussir", value: existingValues.value[3] }
		]
	} catch (error) {
		console.error('Error fetching questionnaire params:', error.message);
	}
}

const newValuesObject = computed(() => {
	return {
		questionnaire_params: {
			try_length: newValue.value[0] || existingValues.value[0],
			cycle_length: newValue.value[1] || existingValues.value[1],
			tries_permitted: newValue.value[2] || existingValues.value[2],
			threshold: newValue.value[3] || existingValues.value[3]
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
	await fetchParams()
}
</script>
