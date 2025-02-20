<template>
	<div class="h-full flex w-full text-black px-4 bg-gradient-to-r from-neutral-300 to-neutral-600">
		<div class="flex flex-col h-full">
			<div class="flex-1 overflow-y-auto my-8 px-8">
				<div v-for="(user, index) in users" :key="index"
					class="py-2 cursor-pointer hover:scale-105 transition duration-300" @click="selectUser(user)">
					<div>
						{{ user.first_name }} {{ user.last_name }}
					</div>
					<div>({{ user.username }})</div>
				</div>
			</div>
		</div>
		<div class="bg-red-500 grow">
			<!-- Adding debug info to verify reactive updates -->
			<div v-if="selectedUserInfo" class="p-8">
				<div>Prénom: {{ selectedUserInfo.first_name }}</div>
				<div>Nom: {{ selectedUserInfo.last_name }}</div>
				<div>Username: {{ selectedUserInfo.username }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from "vue"
import { useSessionStore } from '@/stores/modules/sessionStore'

const sessionStore = useSessionStore()
const users = ref([])
const bla = ref('')
const userSelected = ref(null) // Initialize with null instead of empty object

// Add computed property to help track changes
const selectedUserInfo = computed(() => {
	if (!userSelected.value) return null
	return userSelected.value
})

onMounted(() => {
	fetchUsers()
})

const fetchUsers = async () => {
	try {
		const response = await axios.get('/api/users/unconfirmed', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		users.value = response.data
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const selectUser = (user) => {
	console.log('User selected:', user)
	userSelected.value = { ...user }
}
</script>