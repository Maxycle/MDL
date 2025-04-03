<template>
	<Container>
		<div class="relative">
			<!-- <div class="absolute right-4 rounded bg-green-700 p-2">Essayer le questionnaire</div> -->
			<div class="">
				C'est ici qu'on essplique tout
			</div>
		</div>
	</Container>
</template>

<script setup>
import Container from "@/components/Container.vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
</script>
