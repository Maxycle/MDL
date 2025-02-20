<template>
	<Container>
		<div class="">
			C'est ici qu'on essplique tout
		</div>
		<button class="border-2 border-red-500 rounded-lg bg-blue-400 p-4" @click="router.push('/')">Blog</button>
	</Container>
</template>

<script setup>
import Container from "@/components/Container.vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
</script>
