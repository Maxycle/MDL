<template>
	<Container>
		<div class="mt-8 ml-2 sm:hidden">
			<v-btn color="orange">
				membres

				<v-menu activator="parent">
					<v-list v-for="(user, index) in filteredUsers" :key="index">

						<v-list-item>
							<div @click="selectUser(user)">
								<div class="flex justify-between items-center">
									<div>
										<div>
											{{ user.first_name }} {{ user.last_name }}
										</div>
										<div>({{ user.username }})</div>
									</div>
									<div v-if="userSelected?.id === user.id" class="w-1/6">
										<Logo :scores="scoresInitials" :certification="selectedUserInfo.certification" />
									</div>
								</div>
							</div>
						</v-list-item>

					</v-list>
				</v-menu>
			</v-btn>
		</div>

		<div class="flex w-full text-blueLogoLight pt-8" style="height: calc(100vh - 200px);">
			<div class="w-1/4 h-full hidden sm:block">
				<div class="h-full px-8 flex flex-col">
					<AutocompleteUsers :options="filteredUsers" class="py-4" @user-selected="selectUser" />
					<div class="flex-1 overflow-hidden">
						<div class="h-full overflow-y-auto overscroll-contain text-xs sm:text-sm md:text-lg lg:text-3xl pb-4">
							<div v-for="(user, index) in filteredUsers" :key="index"
								class="py-2 text-orangeLogo cursor-pointer hover:text-blueLogoLight transition duration-300"
								:class="{ 'bg-blueLogoDark px-2 rounded-lg text-yellowLogo font-extrabold': userSelected?.id === user.id }"
								@click="selectUser(user)">
								<div class="flex justify-between items-center">
									<div>
										<div>
											{{ user.first_name }} {{ user.last_name }}
										</div>
										<div>({{ user.username }})</div>
									</div>
									<div v-if="userSelected?.id === user.id" class="w-1/6">
										<Logo :scores="scoresInitials" :certification="selectedUserInfo.certification" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="sm:w-3/4 h-full">
				<div v-if="selectedUserInfo" class="p-4 text-xs sm:text-xl md:text-2xl lg:text-3xl w-full flex flex-col">
					<div class="flex-1 overflow-y-auto">
						<div class="flex items-center justify-center">
							<div
								class="rounded-xl bg-blueLogoDark p-2 lg:p-4 text-sm sm:text-3xl lg:text-5xl text-center text-yellowLogo font-extrabold mx-4 italic">
								{{ selectedUserInfo.username }}
							</div>
						</div>
						<div class="py-2">Prénom: <span class="text-yellowLogo">{{ selectedUserInfo.first_name }}</span></div>
						<div class="py-2">Nom: <span class="text-yellowLogo">{{ selectedUserInfo.last_name }}</span></div>
						<div class="py-2">Intro: <span class="text-yellowLogo">{{ selectedUserInfo.intro }}</span></div>
						<div class="w-full flex justify-center items-center">
							<Logo :scores="scoresInitials" :certification="selectedUserInfo.certification" />
							<div
								class="text-orangeLogo italic text-center lg:text-5xl border-2 border-blueLogoDark rounded-lg p-2 mx-8 mt-2">
								{{
									certificationSentence }}</div>
							<Logo :scores="scoresInitials" :certification="selectedUserInfo.certification" />
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
		filteredUsers.value = users.value.filter((user) => user.certification_is_public === true)
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

const certificationSentence = computed(() => {
	switch (selectedUserInfo.value.certification) {
		case 'SM':
			return `${selectedUserInfo.value.username} est un Simple Membre`
		case 'MC':
			return `${selectedUserInfo.value.username} est un Membre Certifié`
		case 'PP':
			return `${selectedUserInfo.value.username} est un Porte Parole`
		default:
			return `${selectedUserInfo.value.username} est un foutboleure`
	}
})
</script>