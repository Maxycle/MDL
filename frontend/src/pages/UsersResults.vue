<template>
	<Container>
		<div class="h-screen flex w-full text-black">
			<div class="flex flex-col h-full w-1/4 bg-gradient-to-l from-stone-300 to-orange-300">
				<div class="flex-1 my-8 px-8 overflow-y-auto">
					<AutocompleteUsers :options="users" class="py-4" @user-selected="selectUser" />
					<div v-for="(user, index) in filteredUsers" :key="index"
						class="py-2 cursor-pointer hover:scale-105 transition duration-300"
						:class="{ 'bg-orange-700 px-2 rounded-lg shadow-md shadow-stone-600 text-white': userSelected?.id === user.id }"
						@click="selectUser(user)">
						<div v-if="user.certification_is_public">
							<div>
								{{ user.first_name }} {{ user.last_name }}
							</div>
							<div>({{ user.username }})</div>
						</div>
					</div>
				</div>
			</div>
			<div class="bg-gradient-to-r from-stone-300 to-orange-300 w-3/4">
				<!-- Adding debug info to verify reactive updates -->
				<div v-if="selectedUserInfo" class="p-8 text-3xl">
					<div class="flex flex-col items-center">
						<div class="rounded-xl p-4 text-green-700 bg-orange-300 shadow-md shadow-stone-600">{{
							selectedUserInfo.username }}</div>
					</div>
					<div>
						<div class="py-2">Prénom: <span class="text-green-700">{{ selectedUserInfo.first_name }}</span></div>
						<div class="py-2">Nom: <span class="text-green-700">{{ selectedUserInfo.last_name }}</span></div>
						<div class="py-2">Email: <span class="text-green-700">{{ selectedUserInfo.email }}</span></div>
						<div class="py-2">Intro: <span class="text-green-700">{{ selectedUserInfo.intro }}</span></div>
						<div>certification:</div>
						<div class="text-green-800">{{ selectedUserInfo.certification }}</div>
						<div v-if="adminDetails !== null" class="py-2">Contact admin: <span class="text-green-700">{{
							adminDetails.first_name }} {{
									adminDetails.last_name }} aka {{ adminDetails.username }}</span></div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed, watch } from "vue"
// import { useSessionStore } from '@/stores/modules/sessionStore'
import Container from "@/components/Container.vue"
import AutocompleteUsers from '@/components/AutocompleteUsers.vue';


// const sessionStore = useSessionStore()
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

onMounted(async () => {
	await fetchUsers()
	userSelected.value = users.value[0]
})

const fetchUsers = async () => {
	try {
		const response = await axios.get('/api/users')
		users.value = response.data
		filteredUsers.value = users.value
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const selectUser = (user) => {
	userSelected.value = user;
}

watch(selectedAdmin, (newValue) => {
	filteredUsers.value = newValue === null ? users.value : users.value.filter(item => item.selected_admin_id === newValue)
})
</script>