<template>
	<div class="relative bg-gradient-to-l from-orangeLogo to-yellowLogo">
		<div class="bg-white/40 backdrop-invert backdrop-opacity-20 min-h-screen">
			<div v-if="!session.isLoggedIn" class="flex absolute right-4 top-4 space-x-2">
				<div v-if="!isRouteActive('/Blog')"
					class="bg-stone-300 text-black rounded p-2 cursor-pointer shadow-md shadow-stone-600"
					@click="router.push('/Blog')">Blog</div>
				<div v-if="!isRouteActive('/users-results')"
					class="bg-stone-300 text-black rounded p-2 cursor-pointer shadow-md shadow-stone-600"
					@click="router.push('/users-results')">Membres de MDL</div>
				<div v-if="!isRouteActive('/')"
					class="bg-stone-300 text-black rounded p-2 cursor-pointer shadow-md shadow-stone-600"
					@click="router.push('/')">Accueuil</div>
				<div v-if="!isRouteActive('/Login')"
					class="bg-stone-300 text-black rounded p-2 cursor-pointer shadow-md shadow-stone-600"
					@click="router.push('/Login')">Login</div>
				<div v-if="!isRouteActive('/account-creation-request')"
					class="bg-stone-300 text-black rounded p-2 cursor-pointer shadow-md shadow-stone-600"
					@click="router.push('/account-creation-request')">Demande d'ouverture de compte</div>
			</div>
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

const isRouteActive = (path) => {
	return route.path === path;
}
</script>