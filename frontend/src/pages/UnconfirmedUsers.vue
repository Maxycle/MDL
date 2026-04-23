<template>
	<Container>
		<div class="h-full flex w-full text-blueLogoLight">
			<div class="flex flex-col h-screen w-1/4">
				<!-- <div class="flex justify-around py-8"> -->
				<div class="px-4">
					<div class="anarcap-border border-2 rounded-lg">
						<div
							v-for="(title, index) in (['Validées sans compte', 'Validées avec compte', 'Non validées', 'Refusées', 'Bannies'])"
							:key="index" class="">
							<div class="text-yellowLogo p-2 cursor-pointer"
								:class="{ 'bg-blueLogoDark': currentList === title, 'hover:bg-blueLogoLight hover:scale-105 transition duration-300 hover:text-orangeLogoDark hover:font-extrabold': currentList !== title }"
								@click="toggleList(title)">
								{{ title }}</div>
						</div>
					</div>
				</div>
				<div class="flex justify-around py-8">
					<div v-for="(menuOptions, index) in menuAccountRequests" :key="index" class="">
						<div class="relative" @mouseover="showMenu(menuOptions.text)" @mouseout="hideMenu()">
							<div class="border-4 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.text }}</div>
							<Menu v-show="hovered === menuOptions.text"
								:class="{ 'absolute -bottom-13 left-10 z-10': index === 0, 'absolute -bottom-13 -left-10 z-10': index === 1 }"
								:options="menuOptions"
								@optionSelected="(optionSelected) => addFilter(menuOptions.target, optionSelected)" />
						</div>
					</div>
				</div>
				<!-- <div class="flex justify-center">{{ currentList === 'Non validées' ? 'Liste de demandes non validées' : 'Liste de demandes validées sans compte crée' }}</div> -->
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
					<div v-if="selectedUserInfo.referencer" class="py-2">
						Coopté par: <span class="text-yellowLogo">{{ selectedUserInfo.referencer.username }} ({{
							selectedUserInfo.referencer.certification }})</span>
					</div>
				</div>
				<div v-if="selectedUserInfo && showButton" class="flex justify-center space-x-10 text-yellowLogo">
					<button
						class="rounded-lg bg-blue-400 p-4 text-3xl hover:scale-105 hover:bg-blue-700 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-yellowLogo"
						@click="acceptOrRefuseOrBanCandidate('accept', selectedUserInfo.id)">Admettre</button>
					<button
						class="rounded-lg bg-red-400 p-4 text-3xl hover:scale-105 hover:bg-red-500 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-blueLogoLight"
						@click="acceptOrRefuseOrBanCandidate('refuse', selectedUserInfo.id)">Refuser</button>
					<button
						class="rounded-lg bg-red-500 p-4 text-3xl hover:scale-105 hover:bg-red-700 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-blueLogoLight"
						@click="acceptOrRefuseOrBanCandidate('ban', selectedUserInfo.id)">Bannir</button>
				</div>
				<div class="flex justify-center space-x-10 text-yellowLogo">
					<button v-if="selectedUserInfo && selectedUserInfo.status === 3"
						class="rounded-lg bg-red-500 p-4 text-3xl hover:scale-105 hover:bg-red-700 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-blueLogoLight"
						@click="bannedToRefused(selectedUserInfo.id)">Changer statut à refusé</button>
				</div>

				<div v-if="selectedUserInfo && selectedUserInfo.status === 0" class="flex pt-8 pl-8">
					<div class="pr-8">Membres n'ayant pas encore décidé:</div>
					<div>
						<div v-for="(pp, index) in undecidedPPs" :key="index" class="text-yellowLogo">
							{{ pp.username }} ({{ pp.first_name }} {{ pp.last_name }})
						</div>
					</div>
				</div>
				<div v-else-if="selectedUserInfo && selectedUserInfo.status === 2" class="pt-8 pl-8">
					<div v-if="selectedUserInfo.refused_by" class="flex">
						<div class="pr-8">Refusé par:
						</div>
						<div class="text-yellowLogo">
							{{ refusingPP.first_name }} {{ refusingPP.last_name }}
						</div>
					</div>
					<div v-else>
						<div class="flex">
							<div class="pr-8">Banni par:
							</div>
							<div class="text-yellowLogo">
								{{ banningPP.first_name }} {{ banningPP.last_name }}
							</div>
						</div>
						<div class="flex">
							<div class="pr-8">Statut changé de banni à refusé par:
							</div>
							<div class="text-yellowLogo">
								{{ bannedToRefusedPP.first_name }} {{ bannedToRefusedPP.last_name }}
							</div>
						</div>
					</div>
				</div>
				<div v-else-if="selectedUserInfo && selectedUserInfo.status === 3">
					<div class="flex pt-8 pl-8">
						<div class="pr-8">Banni par:
						</div>
						<div class="text-yellowLogo">
							{{ banningPP.first_name }} {{ banningPP.last_name }}
						</div>
					</div>
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
import Menu from "@/components/Menu.vue"
import { menuAccountRequests, accountRequestStatus } from "@/helpers/constants.js"

const sessionStore = useSessionStore()
const userSelected = ref(null) // Initialize with null instead of empty object
const filteredUsers = ref([])
const accountCreationRequests = ref([])
const workingList = ref([])
const validationStatus = ref('false')
const cooptationStatus = ref('Toutes les demandes')
const hovered = ref('')
const pps = ref([])
const undecidedPPs = ref([])
const currentList = ref('Non validées')
const userId = sessionStore.getUserId
const refusingPP = ref({})
const banningPP = ref({})
const bannedToRefusedPP = ref({})
const isAdmin = sessionStore.isAdmin

// Add computed property to help track changes
const selectedUserInfo = computed(() => {
	if (!userSelected.value) return null
	return userSelected.value
})

onMounted(async () => {
	await fetchAccountCreationRequests()
	await fetchPP()

	if (accountCreationRequests.value.length > 0) {
		toggleList('Non validées')
	}
})

const fetchAccountCreationRequests = async () => {
	try {
		const response = await axios.get('/api/account_creation_request', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})

		const accountCreationRequestsWithReferencerInfo = await Promise.all(
			response.data.accountCreationRequests.map(async (user) => {
				if (user.referencer) {
					const referencerData = await fetchUser(user.referencer)
					return {
						...user,
						referencer: referencerData
					}
				}
				return user
			})
		)

		accountCreationRequests.value = accountCreationRequestsWithReferencerInfo

		filteredUsers.value = accountCreationRequests.value
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const fetchUser = async (id) => {
	try {
		const response = await axios.get(`/api/users/${id}`, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		return response.data
	} catch (error) {
		console.error('Error fetching referencer:', id, error)
	}
}

const fetchPP = async () => {
	try {
		const response = await axios.get('/api/users/index_pp', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		pps.value = response.data
	} catch (error) {
		console.error('Error fetching PPs:', error)
	}
}

const selectUser = async (user) => {
	if (!user || !Array.isArray(user.approval_ids)) {
		userSelected.value = null
		undecidedPPs.value = []
		return
	}

	if (user.refused_by) {
		refusingPP.value = await fetchUser(user.refused_by)
	}

	if (user.banned_by) {
		banningPP.value = await fetchUser(user.banned_by)
	}

	if (user.banned_to_refused_by) {
		bannedToRefusedPP.value = await fetchUser(user.banned_to_refused_by)
	}

	userSelected.value = { ...user }
	undecidedPPs.value = pps.value.filter(item => !user.approval_ids.includes(item.id))
}

const filterCandidates = () => {
	let filtered = workingList.value

	if (validationStatus.value === 'Non validées') {
		filtered = filtered.filter(user => !user.approval_ids.includes(userId))
	} else if (validationStatus.value === 'Validées') {
		filtered = filtered.filter(user => user.approval_ids.includes(userId))
	}

	if (cooptationStatus.value === 'Cooptées') {
		filtered = filtered.filter(user => user.referencer !== null)
	} else if (cooptationStatus.value === 'Non cooptées') {
		filtered = filtered.filter(user => user.referencer === null)
	}

	filteredUsers.value = filtered
}

const toggleList = (list) => {
	currentList.value = list
	if (list === 'Validées sans compte') {
		workingList.value = accountCreationRequests.value.filter(request => request.status === 1 && request.user_id === null)
	} else if (list === 'Validées avec compte') {
		workingList.value = accountCreationRequests.value.filter(request => request.status === 1 && request.user_id !== null)
	} else if (list === 'Non validées') {
		workingList.value = accountCreationRequests.value.filter(request => request.status === 0)
	} else if (list === 'Refusées') {
		workingList.value = accountCreationRequests.value.filter(request => request.status === 2)
	} else if (list === 'Bannies') {
		workingList.value = accountCreationRequests.value.filter(request => request.status === 3)
	}
	filterCandidates()
	selectUser(filteredUsers.value[0])
}

const acceptOrRefuseOrBanCandidate = async (action, id) => {
	try {
		const response = await axios.post(`/api/account_creation_request/${id}/${action}_candidate`,
			{},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
		await fetchAccountCreationRequests()
		toggleList(currentList.value)
		userSelected.value = filteredUsers.value[0]
	} catch (error) {
		console.error('Error accepting or refusing or banning account:', error)
	}
}

const bannedToRefused = async (id) => {
	try {
		const response = await axios.post(`/api/account_creation_request/${id}/banned_to_refused_update`,
			{},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
		await fetchAccountCreationRequests()
		toggleList('Bannies')
		userSelected.value = filteredUsers.value[0]
	} catch (error) {
		console.error('Error updating from banned to refused account:', error)
	}
}

const showMenu = (option) => {
	hovered.value = option
}

const hideMenu = () => {
	hovered.value = ''
}

const addFilter = (target, optionSelected) => {
	if (target === 'validation') { validationStatus.value = optionSelected }
	else if (target === 'cooptation') { cooptationStatus.value = optionSelected }
	filterCandidates()
}

const showButton = computed(() => {
	if (!userSelected.value) return false
	if (!Array.isArray(userSelected.value.approval_ids)) return false

	return !userSelected.value.approval_ids.includes(userId) && userSelected.value.status === 0
})
</script>