<template>
	<div class="bg-blackLogo min-h-screen text-xs sm:text-lg">
		<div v-if="!session.isLoggedIn" class="flex space-x-2 justify-end p-2">
			<div v-for="item in boutonData">
				<div v-if="!isRouteActive(item.path)"
					class="bg-stone-300 text-black rounded p-2 cursor-pointer shadow-md shadow-stone-600 flex items-center"
					@click="router.push(item.path)">{{ item.text }}</div>
			</div>
		</div>
		<div class="pt-8 sm:pt-16 2xl:pt-0">
			<slot></slot>
		</div>
	</div>
</template>

<script setup>

import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/modules/sessionStore'

const router = useRouter();
const session = useSessionStore();
const route = useRoute();
const boutonData = [{ path: '/Blog', text: 'Blog' }, { path: '/users-results', text: 'Membres de MDL' }, { path: '/', text: 'Accueuil' }, { path: '/Login', text: 'Login' }, { path: '/account-creation-request', text: 'Demande d\'ouverture de compte' }]
const isRouteActive = (path) => {
	return route.path === path;
}
</script>