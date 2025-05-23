<template>
	<div class="min-h-screen text-black px-12 pt-12 bg-gradient-to-r from-neutral-300 to-neutral-600">
		<div class="flex justify-start">
			<div>
				<div class="border-2 anarcap-border bg-green-500 p-2 rounded mb-4 cursor-pointer" @click="downloadUsers">
					Download utilisateurs/scores</div>
				<div class="flex space-x-4 justify-center pb-4">
					<div v-for="(menuOptions, index) in menuData" :key="index" class="">
						<div class="relative" @mouseover="showMenu(menuOptions.target)" @mouseout="hideMenu(menuOptions.target)">
							<div class="border-4 anarcap-border rounded-lg bg-green-700 text-white p-2">{{ menuOptions.text }}</div>
							<Menu v-show="hovered === menuOptions.target" class="absolute -bottom-13 -left-10 z-10"
								:options="menuOptions"
								@optionSelected="(optionSelected) => addFilter(menuOptions.target, optionSelected)" />
						</div>
					</div>
				</div>
				<AutocompleteUsers :options="users" class="pb-4" @user-selected="selectUser" />
				<div v-for="(user, index) in filteredUsers"
					class="relative justify-start cursor-pointer text-blue-900 underline"
					:class="{ 'bg-gradient-to-l from-orange-100 to-orange-200 p-2 text-orange-800 rounded': user.id === userSelected.id }" @click="selectUser(user)" @mouseover="showUser(index)"
					@mouseout="hideUser(index)">
					{{ user.username }}
					<div v-if="userToShow === index" @click="selectUser(user)"
						class="border-2 border-orange-500 rounded p-1 absolute top-2 left-6 text-nowrap bg-orange-100 z-10">{{
							user.username }} ({{ user.first_name }} {{ user.last_name }})</div>
				</div>
			</div>
			<UserInfo v-if="Object.entries(userSelected).length" :data="userSelected" @user-updated="updateUsers" />
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import UserInfo from '@/components/UserInfo.vue'
import AutocompleteUsers from '@/components/AutocompleteUsers.vue';
import { ref, onMounted, computed } from "vue"
import Menu from '../components/Menu.vue'
import { useSessionStore } from '@/stores/modules/sessionStore'
import { menuData } from '@/helpers/constants.js'

const hovered = ref('')
const userToShow = ref(undefined)
const level = ref('')
const domain = ref('')
const users = ref([])
const sessionStore = useSessionStore()
const userSelected = ref({});

onMounted(async () => {
	await fetchUsers()
	userSelected.value = users.value[0]
})

const selectUser = (user) => {
	userSelected.value = user;
}

const filteredUsers = computed(() => {
	return users.value.filter((user) => {
		return ((!domain.value || user.scores[0]?.domain === domain.value || user.scores[1]?.domain === domain.value)
			&& (!level.value || user.scores[0]?.level === level.value || user.scores[1]?.level === level.value))
	})
})

const fetchUsers = async () => {
	try {
		const response = await axios.get('/api/users', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		users.value = response.data
	} catch (error) {
		console.error('Error fetching options:', error)
	}
}

const showMenu = (option) => {
	hovered.value = option
}

const hideMenu = () => {
	hovered.value = ''
}

const showUser = (index) => {
	userToShow.value = index
}

const hideUser = () => {
	userToShow.value = undefined
}

const addFilter = (target, optionSelected) => {
	if (target === 'domain') { domain.value = optionSelected }
	else if (target === 'level') { level.value = optionSelected }
}

const downloadUsers = async () => {
	try {
		const response = await axios.get('/api/users/export', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			},
			responseType: 'blob'
		})

		// Create a new Blob object using the response data
		const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
		const url = URL.createObjectURL(blob)

		// Create a link element
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.xlsx`);

		// Append the link to the body
		document.body.appendChild(link);

		// Programmatically click the link to trigger the download
		link.click()

		// Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error(`Error creating:`, error);
	}
}

const updateUsers = async (id) => {
  await fetchUsers()
	userSelected.value = users.value.find((item) => item.id === id)
}
</script>
