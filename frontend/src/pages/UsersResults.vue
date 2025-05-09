<template>
	<Container>
		<div class="h-screen flex w-full text-black">
			<div class="flex flex-col w-1/4 bg-gradient-to-r from-[#fc3f1f] to-[#fddd00]">
				<div class="flex-1 bg-white/30 backdrop-invert backdrop-opacity-10">
					<div class="flex-1 my-8 px-8 overflow-y-auto">
						<AutocompleteUsers :options="users" class="py-4" @user-selected="selectUser" />
						<div v-for="(user, index) in filteredUsers" :key="index"
							class="py-2 cursor-pointer hover:scale-105 transition duration-300"
							:class="{ 'bg-orange-700 px-2 rounded-lg shadow-md shadow-stone-600 text-white': userSelected?.id === user.id }"
							@click="selectUser(user)">
							<div v-if="user.certification_is_public" class="flex justify-between items-center">
								<div>
									<div>
										{{ user.first_name }} {{ user.last_name }}
									</div>
									<div>({{ user.username }})</div>
								</div>
								<div v-if="userSelected?.id === user.id" class="w-1/6">
									<Logo :certification="scoresInitials" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="flex flex-col bg-gradient-to-l from-[#fc3f1f] to-[#fddd00] w-3/4">
				<div v-if="selectedUserInfo" class="flex-1 p-8 text-3xl w-full bg-white/30 backdrop-invert backdrop-opacity-10">
					<div class="flex items-center justify-center">
						<div class="rounded-xl p-4 text-white bg-gradient-to-r from-[#245891] to-[#0089d1] shadow-md shadow-stone-600 mx-4">{{
							selectedUserInfo.username }}</div>
					</div>
					<div class="py-2">Prénom: <span class="text-green-700">{{ selectedUserInfo.first_name }}</span></div>
					<div class="py-2">Nom: <span class="text-green-700">{{ selectedUserInfo.last_name }}</span></div>
					<div class="py-2">Intro: <span class="text-green-700">{{ selectedUserInfo.intro }}</span></div>
					<div>certification:</div>
					<div class="text-green-800">{{ selectedUserInfo.certification }}</div>
					<div class="w-full flex justify-center ">
						<div class="w-1/12">
							<Logo :certification="scoresInitials" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed, watch } from "vue"
import Container from "@/components/Container.vue"
import AutocompleteUsers from '@/components/AutocompleteUsers.vue';
import Logo from "@/components/Logo.vue"

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

const scoresInitials = computed(() => {
	// First check if selectedUserInfo.value and scores exist
	if (!selectedUserInfo.value || !selectedUserInfo.value.scores) {
		// Return a default value or empty string when scores are not available
		return 'beginner beginner';
	}

	// Initialize variables for domain levels
	let initialsDN = 'beginner';
	let initialsEA = 'beginner';

	// Loop through scores array to find DN and EA domains
	selectedUserInfo.value.scores.forEach(score => {
		if (score && score.domain === 'DN') {
			initialsDN = score.level;
		} else if (score && score.domain === 'EA') {
			initialsEA = score.level;
		}
	});

	// Return the combined initials
	return initialsDN + ' ' + initialsEA;
});
</script>