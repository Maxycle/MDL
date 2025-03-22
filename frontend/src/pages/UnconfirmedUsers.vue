<template>
	<div class="h-full flex w-full text-black">
		<div class="flex flex-col h-full w-1/4 bg-gradient-to-r from-stone-300 to-orange-300">
			<div class="flex-1 overflow-y-auto my-8 px-8">
				<!-- <div class="rounded bg-green-950 p-2 text-white">Selectionner les vouveaux comptes par admin</div> -->
				<AdminSelect v-model="selectedAdmin" context="non confirmed users" />
				<div v-for="(user, index) in filteredUsers" :key="index"
					class="py-2 cursor-pointer hover:scale-105 transition duration-300"
					:class="{ 'bg-orange-700 px-2 rounded-lg shadow-md shadow-stone-600 text-white': userSelected?.id === user.id }"
					@click="selectUser(user)">
					<div>
						{{ user.first_name }} {{ user.last_name }}
					</div>
					<div>({{ user.username }})</div>
				</div>
			</div>
		</div>
		<div class="bg-gradient-to-l from-stone-300 to-orange-300 w-3/4">
			<!-- Adding debug info to verify reactive updates -->
			<div v-if="selectedUserInfo" class="p-8 text-3xl">
				<div class="py-2">Prénom: <span class="text-green-700">{{ selectedUserInfo.first_name }}</span></div>
				<div class="py-2">Nom: <span class="text-green-700">{{ selectedUserInfo.last_name }}</span></div>
				<div class="py-2">Username: <span class="text-green-700">{{ selectedUserInfo.username }}</span></div>
				<div class="py-2">Email: <span class="text-green-700">{{ selectedUserInfo.email }}</span></div>
				<div class="py-2">Intro: <span class="text-green-700">{{ selectedUserInfo.intro }}</span></div>
				<div v-if="adminDetails !== null" class="py-2">Contact admin: <span class="text-green-700">{{
					adminDetails.first_name }} {{
							adminDetails.last_name }} aka {{ adminDetails.username }}</span></div>
			</div>
			<div v-if="selectedUserInfo" class="flex justify-center space-x-10">
				<button
					class="rounded-lg bg-blue-400 p-4 text-3xl hover:scale-105 hover:bg-blue-700 hover:text-white transition duration-300 shadow-lg shadow-stone-600"
					@click="confirmAccount(selectedUserInfo.id)">Confirmer
					compte</button>
				<button
					class="rounded-lg bg-red-400 p-4 text-3xl hover:scale-105 hover:bg-red-500 hover:text-white transition duration-300 shadow-lg shadow-stone-600">Détruire
					compte</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed, watch } from "vue"
import { useSessionStore } from '@/stores/modules/sessionStore'
import AdminSelect from '@/components/AdminSelect.vue'

const sessionStore = useSessionStore()
const adminDetails = ref(null)
const userSelected = ref(null) // Initialize with null instead of empty object
const selectedAdmin = ref(null)
const filteredUsers = ref(null)
const users = ref(null)

// Add computed property to help track changes
const selectedUserInfo = computed(() => {
	if (!userSelected.value) return null
	return userSelected.value
})

onMounted( async () => {
	await fetchUsers()
	userSelected.value = users.value[0]
})

const fetchUsers = async () => {
	try {
		const response = await axios.get('/api/users/unconfirmed', {
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

const fetchAdminDetails = async (id) => {
	try {
		const response = await axios.get(`/api/users/${id}`, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		adminDetails.value = response.data
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const selectUser = (user) => {
	adminDetails.value = null
	userSelected.value = { ...user }
	user.selected_admin_id ? fetchAdminDetails(user.selected_admin_id) : console.log(`no selected admin for ${user.username}`)
}

const confirmAccount = async (id) => {
	try {
		const response = await axios.post(`/api/admin/users/${id}/confirm`,
			{},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
		fetchUsers()
		userSelected.value = null

	} catch (error) {
		console.error('Error confirming account:', error)
	}
}

watch(selectedAdmin, (newValue) => {
	filteredUsers.value = newValue === null ? users.value : users.value.filter(item => item.selected_admin_id === newValue)
})
</script>