<template>
	<Container>
		<div class="h-full flex w-full text-blueLogoLight">
			<div class="flex flex-col h-full w-1/4">
				<div class="flex justify-around py-8">
					<div v-for="(menuOptions, index) in menuAccountRequests" :key="index" class="">
						<div class="relative" @mouseover="showMenu(menuOptions.text)" @mouseout="hideMenu()">
							<div class="border-4 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.text }}</div>
							<Menu v-show="hovered === menuOptions.text" class="absolute -bottom-13 -left-10 z-10"
								:options="menuOptions"
								@optionSelected="(optionSelected) => addFilter(menuOptions.target, optionSelected)" />
						</div>
					</div>
				</div>
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
				<div v-if="selectedUserInfo && showButton" class="flex justify-center space-x-10 text-blueLogoDark">
					<button
						class="rounded-lg bg-blue-400 p-4 text-3xl hover:scale-105 hover:bg-blue-700 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-yellowLogo"
						@click="acceptOrRefuseCandidate('accept', selectedUserInfo.id)"
						:disabled="validationStatus === 'Validées'">Admettre</button>
					<button
						class="rounded-lg bg-red-400 p-4 text-3xl hover:scale-105 hover:bg-red-500 hover:text-white transition duration-300 hover:shadow-lg hover:shadow-blueLogoLight"
						@click="acceptOrRefuseCandidate('refuse', selectedUserInfo.id)"
						:disabled="validationStatus === 'Validées'">Refuser</button>
				</div>
				<div class="flex pt-8">
					<div class="text-xl p-8">Membres n'ayant pas encore décidé:</div>
					<div>
						<div v-for="(pp, index) in undecidedPPs" :key="index" class="text-yellowLogo">
							{{ pp.username }} ({{ pp.first_name }} {{ pp.last_name }})
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
import { menuAccountRequests } from "@/helpers/constants.js"

const sessionStore = useSessionStore()
const userSelected = ref(null) // Initialize with null instead of empty object
const filteredUsers = ref(null)
const users = ref(null)
const validationStatus = ref(false)
const cooptationStatus = ref('Toutes les demandes')
const hovered = ref('')
const pps = ref(null)
const undecidedPPs = ref(null)

// Add computed property to help track changes
const selectedUserInfo = computed(() => {
	if (!userSelected.value) return null
	return userSelected.value
})

onMounted(async () => {
	await fetchAccountCreationRequests()
	await fetchPP()
	userSelected.value = users.value[0]
})

const fetchAccountCreationRequests = async () => {
	try {
		const response = await axios.get('/api/account_creation_request', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})

		// Enhance users with referencer data
		const usersWithReferencerInfo = await Promise.all(
			response.data.map(async (user) => {
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

		users.value = usersWithReferencerInfo
		filteredUsers.value = users.value
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
		console.error('Error fetching referencer:', error)
	}
}

const fetchPP = async () => {
	try {
		const response = await axios.get('/api/users/index_pp', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		console.log('response fetchPP', response.data)
		pps.value = response.data
	} catch (error) {
		console.error('Error fetching PPs:', error)
	}
}

const selectUser = (user) => {
	userSelected.value = { ...user }
	undecidedPPs.value = pps.value.filter(item => !user.approval_ids.includes(item.id))
}

const filterCandidates = () => {
	let filtered = users.value
	const userId = sessionStore.getUserId

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
		userSelected.value = filteredUsers.value[0]
	} catch (error) {
		console.error('Error refusing account:', error)
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
	return !userSelected.value.approval_ids.includes(sessionStore.getUserId)
})
</script>