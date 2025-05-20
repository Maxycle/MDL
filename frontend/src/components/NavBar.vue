<template>
	<div class="flex justify-between px-4 items-center bg-blueLogoLight">
		<div class="italic text-yellowLogo font-extrabold text-xl">{{ paramsStore.getParams.welcome_start }} {{ store.getUserUsername }}{{
			paramsStore.getParams.welcome_end }}
		</div>
		<div class="flex justify-end space-x-2">
			<NavBarButton :isActive="isRouteActive('/')">
				<span class="relative"><router-link to="/">Accueil</router-link></span>
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/home-questionnaire')">
				<span class="relative"><router-link to="/home-questionnaire">Mes résultats</router-link></span>
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/users-results')">
				<span class="relative"><router-link to="/users-results">Membres</router-link></span>
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/questionnaire')">
				<span class="relative"><router-link to="/questionnaire">Questionnaire</router-link></span>
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/nouvelle-question')" @mouseover="showMenu"
				@mouseout="hideMenu" class="relative">
				<span>Actions</span>
				<ActionsMenu v-show="showActionsMenu" class="absolute top-12 -left-44 w-fit" />
			</NavBarButton>
			<NavBarButton :isActive="isRouteActive('/Blog')">
				<span class="relative"><router-link to="/Blog">Blog</router-link></span>
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
import NavBarButton from './buttons/NavBarButton.vue'
import ActionsMenu from './ActionsMenu.vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from '@/stores/modules/sessionStore'
import { useAnswerStore } from '@/stores/modules/answerStore'
import { useParamsStore } from '@/stores/modules/paramsStore'

const paramsStore = useParamsStore()
const answerStore = useAnswerStore()
const store = useSessionStore();
const router = useRouter();
const route = useRoute();
const showActionsMenu = ref(false)

onMounted(async () => {
	if (!paramsStore.getIsLoaded) {
		await paramsStore.fetchParams()
	}
})

const actionsMenuShowing = computed(() => {
	return !(store.getUserCertification === "SM" && !store.isAdmin)
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
	showActionsMenu.value = true
}

const hideMenu = () => {
	showActionsMenu.value = false
}
</script>