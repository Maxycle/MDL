<template>
	<Container>
		<div class="h-full flex w-full text-blueLogoLight">
			<div class="flex flex-col h-full w-1/4">
				<div class="flex justify-around mt-10 px-28 text-orangeLogoDark">
					<button class="rounded-lg bg-green-400 px-2 shadow-md shadow-stone-600 mr-2"
						@click="filterCandidates('cooptés')">{{
							cooptedButtonLabel }}</button>
					<button class="rounded-lg bg-green-400  px-2 shadow-md shadow-stone-600"
						@click="filterCandidates('non cooptés')">{{
							nonCooptedButtonLabel }}</button>
				</div>
				<p class="flex justify-center pt-4 underline">{{ listTitle }} </p>
				<div class="flex-1 overflow-y-auto my-2 px-8">
					<div v-for="(user, index) in filteredUsers" :key="index"
						class="py-2 cursor-pointer hover:scale-105 transition duration-300 text-orangeLogo"
						:class="{ 'bg-blueLogoDark px-2 rounded-lg text-yellowLogo font-bold': userSelected?.id === user.id }"
						@click="selectUser(user)">
						<div class="">
							{{ user.first_name }} {{ user.last_name }}
						</div>
					</div>
				</div>
			</div>
			<div class="w-3/4">
				<div v-if="selectedUserInfo" class="p-8 text-3xl">
					<div class="py-2">Prénom: <span class="text-yellowLogo">{{ selectedUserInfo.first_name }}</span></div>
					<div class="py-2">Nom: <span class="text-yellowLogo">{{ selectedUserInfo.last_name }}</span></div>
					<div class="py-2">Email: <span class="text-yellowLogo">{{ selectedUserInfo.email }}</span></div>
					<div class="py-2">Motivations: <span class="text-yellowLogo">{{ selectedUserInfo.motivations }}</span></div>
				</div>
				<div v-if="selectedUserInfo" class="flex justify-center space-x-10 text-blueLogoDark">
					<button
						class="rounded-lg bg-blue-400 p-4 text-3xl hover:scale-105 hover:bg-blue-700 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-yellowLogo"
						@click="acceptOrRefuseCandidate('accept', selectedUserInfo.id)">Admettre</button>
					<button
						class="rounded-lg bg-red-400 p-4 text-3xl hover:scale-105 hover:bg-red-500 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-blueLogoLight"
						@click="acceptOrRefuseCandidate('refuse', selectedUserInfo.id)">Refuser</button>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from "vue"
import { useSessionStore } from '@/stores/modules/sessionStore'
import Container from "@/components/Container.vue"

const sessionStore = useSessionStore()
const userSelected = ref(null) // Initialize with null instead of empty object
const filteredUsers = ref(null)
const users = ref(null)
const listTitle = ref('tous les candidats')
const cooptedButtonLabel = ref('Cooptés')
const nonCooptedButtonLabel = ref('Non cooptés')

// Add computed property to help track changes
const selectedUserInfo = computed(() => {
	if (!userSelected.value) return null
	return userSelected.value
})

onMounted(async () => {
	await fetchAccountCreationRequests()
	userSelected.value = users.value[0]
})

const fetchAccountCreationRequests = async () => {
	try {
		const response = await axios.get('/api/account_creation_request?pending_approval=true', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		users.value = response.data
		filteredUsers.value = users.value
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const selectUser = (user) => {
	userSelected.value = { ...user }
}

// Refactored filter function
const filterCandidates = (filterType) => {
	// Reset to initial state if clicking the same filter that's already active
	if (listTitle.value === `Candidats ${filterType}`) {
		filteredUsers.value = users.value
		listTitle.value = 'Tous les candidats'
		cooptedButtonLabel.value = 'cooptés'
		nonCooptedButtonLabel.value = 'non cooptés'
		return
	}

	// Apply the appropriate filter
	if (filterType === 'cooptés') {
		filteredUsers.value = users.value.filter((user) => user.referencer !== null)
	} else if (filterType === 'non cooptés') {
		filteredUsers.value = users.value.filter((user) => user.referencer === null)
	}

	// Update UI elements
	listTitle.value = `Candidats ${filterType}`
	cooptedButtonLabel.value = filterType === 'cooptés' ? 'tous les candidats' : 'cooptés'
	nonCooptedButtonLabel.value = filterType === 'non cooptés' ? 'tous les candidats' : 'non cooptés'
}

const filterCandidatesAfterAcceptingOrRefusing = () => {
	if (listTitle.value === 'Candidats cooptés') {
		filteredUsers.value = users.value.filter((user) => user.referencer !== null)
	} else if (listTitle.value === 'Candidats non cooptés') {
		filteredUsers.value = users.value.filter((user) => user.referencer === null)
	}
}

const acceptOrRefuseCandidate = async (action, id) => {
	try {
		const response = await axios.post(`/api/account_creation_request/${id}/${action}_candidate`,
			{},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
		await fetchAccountCreationRequests()
		filterCandidatesAfterAcceptingOrRefusing()
		userSelected.value = filteredUsers.value[0]
	} catch (error) {
		console.error('Error refusing account:', error)
	}
}
</script>