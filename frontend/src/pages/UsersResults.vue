<template>
	<Container>
		<div class="flex w-full text-black" style="height: calc(100vh - 200px);">
			<div class="w-1/4 h-full">
				<div class="h-full px-8 py-8 flex flex-col">
					<AutocompleteUsers :options="users" class="py-4" @user-selected="selectUser" />
					<div class="flex-1 overflow-hidden">
						<div class="h-full overflow-y-auto overscroll-contain pb-4">
							<div v-for="(user, index) in filteredUsers" :key="index"
								class="py-2 cursor-pointer hover:text-blueLogoDark transition duration-300"
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
			</div>
			<div class="w-3/4 h-full">
				<div v-if="selectedUserInfo" class="p-8 text-3xl w-full h-full flex flex-col">
					<div class="flex-1 overflow-y-auto">
						<div class="flex items-center justify-center">
							<div
								class="rounded-xl p-4 text-white bg-gradient-to-r from-blueLogoDark to-blueLogoLight shadow-md shadow-stone-600 mx-4">
								{{ selectedUserInfo.username }}
							</div>
						</div>
						<div class="py-2">Prénom: <span class="text-green-700">{{ selectedUserInfo.first_name }}</span></div>
						<div class="py-2">Nom: <span class="text-green-700">{{ selectedUserInfo.last_name }}</span></div>
						<div class="py-2">Intro: <span class="text-green-700">{{ selectedUserInfo.intro }}</span></div>
						<div>certification: <span class="text-green-800">{{ selectedUserInfo.certification }}</span></div>
						<div class="w-full flex justify-center">
							<div class="w-1/12">
								<Logo :certification="scoresInitials" />
							</div>
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

const userSelected = ref(null) // Initialize with null instead of empty object
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