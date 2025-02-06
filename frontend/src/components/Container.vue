<template>
	<div class="relative bg-gradient-to-b from-black to-blue-900 text-white p-4">
		<div v-if="!session.isLoggedIn" class="bg-stone-300 text-black rounded absolute right-4 top-4 p-2 cursor-pointer" @click="router.push('/Login')">Login</div>
		<slot></slot>
	</div>
</template>

<script setup>

import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/modules/sessionStore'

const router = useRouter();
const session = useSessionStore();

</script>