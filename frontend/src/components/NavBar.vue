<template>
	<div class="flex justify-between px-4 items-center bg-blue-900">
		<div class="italic">{{ paramsStore.getParams.welcome_start}} {{ loggedInUser.username }} {{ paramsStore.getParams.welcome_end}}
		</div>
		<div v-if="answerStore.getQuestionnaireDetails.domain && route.path ==='/questionnaire'" class="text-blue-100">
			<div>domaine: <span class="font-bold italic">{{
				answerStore.getQuestionnaireDetails.domain }}</span></div>
			<div>niveau: <span class="font-bold italic">{{
				answerStore.getQuestionnaireDetails.button }}</span></div>
		</div>
		<div class="flex justify-end space-x-2">
			<NavBarButton :isActive="isRouteActive('/')">
				<span class="relative"><router-link to="/">Accueil</router-link></span>
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/questionnaire')">
				<span class="relative"><router-link to="/questionnaire">Questionnaire</router-link></span>
			</NavBarButton>
			<NavBarButton v-if="loggedInUser.admin" :isActive="isRouteActive('/nouvelle-question')" @mouseover="showMenu"
				@mouseout="hideMenu" class="relative">
				<span>Admin</span>
				<AdminMenu v-show="showAdminMenu" class="absolute top-12 -left-44 w-fit" />
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/edit-profile')">
				<span class="relative"><router-link to="/edit-profile">Modifier le compte</router-link></span>
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
import NavBarButton from './buttons/NavBarButton.vue'
import AdminMenu from './AdminMenu.vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { useSessionStore } from '@/stores/modules/sessionStore'
import { useAnswerStore } from '@/stores/modules/answerStore'
import { useParamsStore } from '@/stores/modules/paramsStore'

const paramsStore = useParamsStore()
const answerStore = useAnswerStore()
const store = useSessionStore();
const router = useRouter();
const route = useRoute();
const showAdminMenu = ref(false)

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

const loggedInUser = computed(() => {
	return store.user;
})

const isRouteActive = (path) => {
	return route.path === path;
}

const logout = async () => {
	try {
		await store.logoutUser()
		router.push('/')
	} catch (error) {
		console.error('Error logging out', error);
	}
}

const showMenu = () => {
	showAdminMenu.value = true
}

const hideMenu = () => {
	showAdminMenu.value = false
}
</script>