<template>
	<div class="flex justify-between px-4 items-center bg-gradient-to-r from-neutral-400 to-neutral-300 shadow-md shadow-gray-700">
		<div>Salut {{ loggedInUser.username }}, devient un vrai libertarien avec des couilles en fer !!</div>
		<div class="flex justify-end space-x-2">
			<NavBarButton :isActive="isRouteActive('/')">
				<span class="relative"><router-link to="/">Home</router-link></span>
			</NavBarButton>
			<NavBarButton @click="redirectToEditProfile">
				<span class="relative">Edit profile</span>
			</NavBarButton>
			<NavBarButton v-if="store.isLoggedIn" @click="logout">
				<span class="relative">Logout</span>
			</NavBarButton>
			<NavBarButton v-else :isActive="isRouteActive('/Login')" @click="router.push('/Login')">
				<span class="relative">Login</span>
			</NavBarButton>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios';
import NavBarButton from './buttons/NavBarButton.vue';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { useSessionStore } from '@/stores/modules/sessionStore';

const store = useSessionStore();
const router = useRouter();
const route = useRoute();
const isLoading = ref(false)

axios.defaults.baseURL = 'http://localhost:3000'

const loggedInUser = computed(() => {
	return store.user;
})

const isRouteActive = (path) => {
	return route.path === path;
};

const logout = async () => {
	try {
		await store.logoutUser()
		router.push('/')
	} catch (error) {
		console.error('Error logging out', error);
	}
};

const redirectToEditProfile = () => {
	window.location.href = '/users/edit';
};
</script>